/\*\*

-   ========================================================================
-   MAPEAMENTO: SIMULAÇÃO → CÓDIGO REAL DO MEET TRACK
-   ========================================================================
-
-   Este arquivo mostra como o código simulado se traduz para o código real
-   da extensão Meet Track, com exemplos concretos de cada arquivo.
    \*/

// ============================================================================
// 1. CONTENT SCRIPT - Captura de Seleção de Texto
// ============================================================================

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO (fluxo-mensagens-detalhado.js) │
└─────────────────────────────────────────────────────────────────────────┘
_/

class ContentScript {
captureText(text) {
messageBus.sendMessage('content', {
type: MESSAGE_TYPES.TEXT_SELECTED,
payload: { text, url: 'https://meet.google.com/xyz-meeting' }
}, (response) => {
console.log('✅ Confirmação recebida:', response);
});
}
}

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL (src-bex/content-scripts/selection-capture.ts) │
└─────────────────────────────────────────────────────────────────────────┘
_/

// Captura texto selecionado quando usuário solta o mouse
document.addEventListener('mouseup', () => {
const selectedText = window.getSelection()?.toString().trim();

if (!selectedText || selectedText.length < 3) {
return; // Ignora seleções muito pequenas
}

// Envia para background script
chrome.runtime.sendMessage({
source: 'selection-capture',
action: 'send-to-sidebar',
text: selectedText,
url: window.location.href,
timestamp: new Date().toISOString()
});
});

// ============================================================================
// 2. BACKGROUND SCRIPT - Recebe e Processa Mensagens
// ============================================================================

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO │
└─────────────────────────────────────────────────────────────────────────┘
_/

class BackgroundScript {
onMessage(message, sender, sendResponse) {
switch (message.type) {
case MESSAGE_TYPES.TEXT_SELECTED:
this.handleTextSelected(message.payload, sendResponse);
break;

      case MESSAGE_TYPES.SEND_CHAT_MESSAGE:
        this.handleChatMessage(message.payload, sendResponse);
        break;
    }

}

handleTextSelected(payload, sendResponse) {
// Broadcast para todos
messageBus.broadcast('background', {
type: MESSAGE_TYPES.TEXT_CAPTURED,
payload: payload
});

    sendResponse({ success: true });

}

async handleChatMessage(payload, sendResponse) {
const response = await this.callAPI('/api/chat', payload);
sendResponse({ success: true, data: response });
}
}

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL (src-bex/background.ts) │
└─────────────────────────────────────────────────────────────────────────┘
_/

import { bridge } from './bridge';

// Listener principal de mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
console.log('[Background] Mensagem recebida:', request);

// Roteamento de mensagens por fonte
switch (request.source) {
case 'selection-capture':
handleSelectionCapture(request);
break;

    case 'jumpad-context-menu':
      handleContextMenu(request);
      break;

    case 'audio-recorder-modal':
      handleRecording(request);
      break;

}

return true; // Mantém canal aberto para resposta assíncrona
});

/\*\*

-   Handler: Texto selecionado
    \*/
    function handleSelectionCapture(request: any) {
    console.log('[Background] Texto capturado:', request.text);

// Envia para Vue App via bridge
bridge.send('content:text-selected', {
text: request.text,
url: request.url,
timestamp: request.timestamp
});
}

/\*\*

-   Listener do bridge (comunicação com Vue App)
    \*/
    bridge.on('chat:send-message', async (payload) => {
    console.log('[Background] Enviando mensagem para IA', payload);

try {
// Obtém token de autenticação
const token = await getAuthToken();

    // Chama API externa
    const response = await fetch('https://api.meettrack.com/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: payload.text,
        agentId: payload.agentId,
        conversationId: payload.conversationId
      })
    });

    const data = await response.json();

    // Retorna resposta para Vue App
    return {
      success: true,
      data: data
    };

} catch (error) {
console.error('[Background] Erro ao enviar mensagem:', error);
return {
success: false,
error: error.message
};
}
});

/\*\*

-   Obtém token de autenticação do storage
    \*/
    async function getAuthToken(): Promise<string> {
    const result = await chrome.storage.local.get(['authToken']);
    return result.authToken || null;
    }

// ============================================================================
// 3. VUE APP - Interface e Serviços
// ============================================================================

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO │
└─────────────────────────────────────────────────────────────────────────┘
_/

class VueApp {
onMessage(message) {
switch (message.type) {
case MESSAGE_TYPES.TEXT_CAPTURED:
this.onTextCaptured(message.payload);
break;

      case MESSAGE_TYPES.CHAT_RESPONSE:
        this.onChatResponse(message.payload);
        break;
    }

}

sendMessage(text) {
messageBus.sendMessage('popup', {
type: MESSAGE_TYPES.SEND_CHAT_MESSAGE,
payload: { text, agentId: 'gpt-4' }
}, (response) => {
console.log('✅ Confirmação:', response);
});
}
}

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL (src/services/MessagingService.ts) │
└─────────────────────────────────────────────────────────────────────────┘
_/

import { bexBridge } from 'boot/eventBus';
import { useConversationStore } from 'src/stores/conversationStore';

export class MessagingService {
private conversationStore = useConversationStore();

/\*\*

-   Envia mensagem para IA
    \*/
    async sendMessage(text: string, agentId: string): Promise<void> {
    // Adiciona mensagem do usuário localmente
    this.conversationStore.addMessage({
    role: 'user',
    content: text,
    timestamp: new Date().toISOString()
    });


    try {
      // Envia para background via bridge
      const response = await bexBridge.send('chat:send-message', {
        text,
        agentId,
        conversationId: this.conversationStore.currentConversationId
      });

      if (response.success) {
        // Adiciona resposta da IA
        this.conversationStore.addMessage({
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(response.error);
      }

    } catch (error) {
      console.error('[MessagingService] Erro ao enviar mensagem:', error);

      // Mostra erro na UI
      this.conversationStore.addMessage({
        role: 'system',
        content: 'Erro ao enviar mensagem. Tente novamente.',
        timestamp: new Date().toISOString()
      });
    }

}

/\*\*

-   Listener para eventos do background
    \*/
    setupListeners() {
    // Escuta texto capturado
    bexBridge.on('content:text-selected', (payload) => {
    console.log('[MessagingService] Texto capturado:', payload.text);
        // Adiciona ao buffer de textos capturados
        this.conversationStore.addCapturedText(payload.text);
    });


    // Escuta transcrição pronta
    bexBridge.on('transcription:ready', (payload) => {
      console.log('[MessagingService] Transcrição pronta:', payload.recordingId);

      // Atualiza store com transcrição
      this.conversationStore.addTranscription(payload.transcription);
    });

}
}

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL (src/modules/chat/pages/ChatPage.vue) │
└─────────────────────────────────────────────────────────────────────────┘
_/

// <script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConversationStore } from 'src/stores/conversationStore';
import { MessagingService } from 'src/services/MessagingService';

const conversationStore = useConversationStore();
const messagingService = new MessagingService();
const messageInput = ref('');

/\*\*

-   Envia mensagem ao clicar no botão
    \*/
    async function sendMessage() {
    if (!messageInput.value.trim()) return;

const text = messageInput.value;
messageInput.value = ''; // Limpa input

// Envia via serviço
await messagingService.sendMessage(
text,
conversationStore.selectedAgent.id
);
}

/\*\*

-   Inicializa listeners
    \*/
    onMounted(() => {
    messagingService.setupListeners();
    });
    // </script>

// ============================================================================
// 4. BRIDGE - Sistema de Comunicação Quasar BEX
// ============================================================================

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL (src-bex/bridge.ts) │
└─────────────────────────────────────────────────────────────────────────┘
_/

import { Bridge } from '@quasar/app-bex';

export const bridge = new Bridge({
listen(fn) {
// Registra listener para mensagens do Vue App
chrome.runtime.onMessage.addListener(fn);
},

send(data) {
// Envia mensagem para Vue App
chrome.runtime.sendMessage(data);
}
});

/_
┌─────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL (src/boot/eventBus.ts) - Vue App Side │
└─────────────────────────────────────────────────────────────────────────┘
_/

import { BexBridge } from '@quasar/app-bex';

export const bexBridge = new BexBridge({
listen(fn) {
// Registra listener no Vue App
window.addEventListener('message', (event) => {
if (event.data && event.data.from === 'bex-bridge') {
fn(event.data);
}
});
},

send(data) {
// Envia mensagem para background
return new Promise((resolve) => {
const id = Date.now();

      // Listener para resposta
      const listener = (event: MessageEvent) => {
        if (event.data && event.data.id === id) {
          window.removeEventListener('message', listener);
          resolve(event.data.response);
        }
      };

      window.addEventListener('message', listener);

      // Envia mensagem
      window.postMessage({
        from: 'bex-bridge',
        id,
        data
      }, '*');
    });

}
});

// ============================================================================
// 5. FLUXO COMPLETO REAL - PASSO A PASSO
// ============================================================================

/\*
═══════════════════════════════════════════════════════════════════════════
CENÁRIO: Usuário seleciona texto e envia para chat
═══════════════════════════════════════════════════════════════════════════

1. CAPTURA DE TEXTO (Content Script)
   📄 Arquivo: src-bex/content-scripts/selection-capture.ts

    document.addEventListener('mouseup', () => {
    const text = window.getSelection()?.toString().trim();

    chrome.runtime.sendMessage({
    source: 'selection-capture',
    action: 'send-to-sidebar',
    text: text
    });
    });

    ↓↓↓

2. RECEBIMENTO NO BACKGROUND
   ⚙️ Arquivo: src-bex/background.ts

    chrome.runtime.onMessage.addListener((request) => {
    if (request.source === 'selection-capture') {
    bridge.send('content:text-selected', {
    text: request.text
    });
    }
    });

    ↓↓↓

3. RECEBIMENTO NO VUE APP
   🎨 Arquivo: src/services/MessagingService.ts

    bexBridge.on('content:text-selected', (payload) => {
    conversationStore.addCapturedText(payload.text);
    });

    ↓↓↓

4. USUÁRIO CLICA EM "ENVIAR"
   🎨 Arquivo: src/modules/chat/pages/ChatPage.vue

    async function sendMessage() {
    await messagingService.sendMessage(
    messageInput.value,
    selectedAgent.id
    );
    }

    ↓↓↓

5. SERVIÇO ENVIA VIA BRIDGE
   🎨 Arquivo: src/services/MessagingService.ts

    const response = await bexBridge.send('chat:send-message', {
    text,
    agentId
    });

    ↓↓↓

6. BACKGROUND CHAMA API
   ⚙️ Arquivo: src-bex/background.ts

    bridge.on('chat:send-message', async (payload) => {
    const token = await getAuthToken();

    const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
    });

    return await response.json();
    });

    ↓↓↓

7. RESPOSTA VOLTA PARA VUE APP
   🎨 Arquivo: src/services/MessagingService.ts

    if (response.success) {
    conversationStore.addMessage({
    role: 'assistant',
    content: response.data.message
    });
    }

═══════════════════════════════════════════════════════════════════════════
\*/

// ============================================================================
// 6. COMPARAÇÃO DIRETA: SIMULAÇÃO vs REAL
// ============================================================================

/\*
┌────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO │
└────────────────────────────────────────────────────────────────────────┘

messageBus.sendMessage('content', {
type: 'TEXT_SELECTED',
payload: { text: 'Hello' }
}, (response) => {
console.log('Resposta:', response);
});

┌────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL │
└────────────────────────────────────────────────────────────────────────┘

chrome.runtime.sendMessage({
source: 'selection-capture',
action: 'send-to-sidebar',
text: 'Hello'
});

───────────────────────────────────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO │
└────────────────────────────────────────────────────────────────────────┘

messageBus.addListener('background', (message, sender, sendResponse) => {
if (message.type === 'TEXT_SELECTED') {
handleTextSelected(message.payload);
sendResponse({ success: true });
}
});

┌────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL │
└────────────────────────────────────────────────────────────────────────┘

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.source === 'selection-capture') {
bridge.send('content:text-selected', {
text: request.text
});
}
return true;
});

───────────────────────────────────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO │
└────────────────────────────────────────────────────────────────────────┘

messageBus.broadcast('background', {
type: 'TEXT_CAPTURED',
payload: { text: 'Hello' }
});

┌────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL │
└────────────────────────────────────────────────────────────────────────┘

bridge.send('content:text-selected', {
text: 'Hello'
});

───────────────────────────────────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────────────┐
│ SIMULAÇÃO │
└────────────────────────────────────────────────────────────────────────┘

class VueApp {
sendMessage(text) {
messageBus.sendMessage('popup', {
type: 'SEND_CHAT_MESSAGE',
payload: { text }
});
}
}

┌────────────────────────────────────────────────────────────────────────┐
│ CÓDIGO REAL │
└────────────────────────────────────────────────────────────────────────┘

class MessagingService {
async sendMessage(text: string) {
const response = await bexBridge.send('chat:send-message', {
text,
agentId: this.currentAgent
});

    this.conversationStore.addMessage(response.data);

}
}
\*/

console.log('\n✅ Mapeamento completo simulação → código real');
console.log('📚 Use este arquivo como referência para entender a arquitetura\n');
