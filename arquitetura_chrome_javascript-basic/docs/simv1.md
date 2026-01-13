/\*\*

-   ========================================================================
-   DIAGRAMA VISUAL DA ARQUITETURA CHROME EXTENSION - MEET TRACK
-   ========================================================================
    \*/

/\*

┌─────────────────────────────────────────────────────────────────────┐
│ PÁGINA WEB (Google Meet) │
│ │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ CONTENT SCRIPT (content.js) │ │
│ │ │ │
│ │ • Captura seleção de texto │ │
│ │ • Injeta botão flutuante │ │
│ │ • Injeta modal de gravação │ │
│ │ • Escuta eventos do DOM │ │
│ │ • NÃO pode acessar APIs externas (CORS) │ │
│ │ │ │
│ │ Métodos: │ │
│ │ - captureTextSelection() │ │
│ │ - toggleSidebar() │ │
│ │ - startRecording() │ │
│ │ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│ ↓ ↑ │
│ chrome.runtime.sendMessage() │
│ chrome.runtime.onMessage │
└─────────────────────────────────────────────────────────────────────┘
↓ ↑
│ │
│ │ Mensagens sempre
│ │ passam pelo Background
│ │
↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│ BACKGROUND SCRIPT - Service Worker (Manifest V3) │
│ (background.js) │
│ │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ chrome.runtime.onMessage.addListener │ │
│ │ │ │
│ │ RESPONSIBILITIES: │ │
│ │ • Recebe TODAS as mensagens da extensão │ │
│ │ • Gerencia tokens de autenticação │ │
│ │ • Faz chamadas à API externa (sem CORS!) │ │
│ │ • Intercepta e modifica requisições │ │
│ │ • Controla chrome.sidePanel, contextMenus │ │
│ │ • Faz broadcast para múltiplos contextos │ │
│ │ │ │
│ │ Handlers: │ │
│ │ - handleTextSelection() → broadcast para sidebar │ │
│ │ - handleChatMessage() → chama API → retorna resposta │ │
│ │ - handleStartRecording() → gerencia gravação │ │
│ │ - handleSaveMeeting() → salva no backend │ │
│ │ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│ │
│ ↓ ↓ │
│ │ │ │
│ chrome.runtime.sendMessage fetch() │
│ (broadcast) (API externa) │
│ │ │ │
└─────────────────────────────────────────────────────────────────────┘
↓ ↓
┌───────────────┴────────────┐ │
│ │ │
↓ ↓ ↓
┌──────────────────────┐ ┌─────────────────────────────┐
│ SIDE PANEL (Vue) │ │ API BACKEND │
│ (popup.html) │ │ (Node.js/Express) │
│ │ │ │
│ Vue 3 + Quasar │ │ Endpoints: │
│ TypeScript │ │ • POST /api/chat │
│ Pinia Stores │ │ • POST /api/meetings │
│ │ │ • GET /api/recordings │
│ Components: │ │ • POST /api/transcriptions │
│ • ChatPage │ │ │
│ • RecordingPage │ │ Database: │
│ • AgentSelector │ │ • PostgreSQL │
│ │ │ • Redis (cache) │
│ Services: │ │ │
│ • MessagingService │ │ Auth: │
│ • bridge.send() │ │ • JWT tokens │
│ │ │ • OAuth 2.0 │
└──────────────────────┘ └─────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
FLUXOS DE COMUNICAÇÃO
═══════════════════════════════════════════════════════════════════════

FLUXO 1: Seleção de Texto
─────────────────────────────────────────────────────────────────────

1. Usuário seleciona texto na página
   ↓
2. Content Script captura (window.getSelection())
   ↓
3. chrome.runtime.sendMessage({ type: 'TEXT_SELECTED', text: '...' })
   ↓
4. Background recebe no onMessage.addListener
   ↓
5. Background faz broadcast para todos os contextos
   ↓
6. Vue App (Side Panel) recebe e atualiza UI
   ↓
7. Texto aparece na lista de textos capturados

FLUXO 2: Envio de Mensagem para IA
─────────────────────────────────────────────────────────────────────

1. Usuário digita mensagem no chat (Vue App)
   ↓
2. Vue Component chama MessagingService.sendMessage()
   ↓
3. bexBridge.send('chat:send-message', { text, agentId })
   ↓
4. Background recebe via bridge.on()
   ↓
5. Background adiciona Authorization header com JWT token
   ↓
6. fetch('https://api.meettrack.com/chat', { headers: { Authorization } })
   ↓
7. API processa com LLM (GPT-4, Claude, etc)
   ↓
8. Background recebe resposta da API
   ↓
9. Background faz broadcast({ type: 'CHAT_RESPONSE', data })
   ↓
10. Vue App recebe broadcast e atualiza Pinia store
    ↓
11. Componente ChatPage renderiza mensagem da IA

FLUXO 3: Gravação de Reunião
─────────────────────────────────────────────────────────────────────

1. Usuário clica em "Iniciar Gravação" no modal (Content Script)
   ↓
2. Content Script captura stream de áudio (getUserMedia)
   ↓
3. chrome.runtime.sendMessage({ type: 'START_RECORDING' })
   ↓
4. Background cria registro de gravação
   ↓
5. Content Script envia chunks de áudio via sendMessage
   ↓
6. Background faz upload multipart para API
   ↓
7. API armazena em S3/Cloud Storage
   ↓
8. API processa transcrição (Whisper AI)
   ↓
9. Background recebe notificação de conclusão (webhook)
   ↓
10. Background faz broadcast({ type: 'TRANSCRIPTION_READY' })
    ↓
11. Vue App exibe notificação e atualiza lista de gravações

═══════════════════════════════════════════════════════════════════════
CHROME APIS UTILIZADAS NO MEET TRACK
═══════════════════════════════════════════════════════════════════════

• chrome.runtime
├── sendMessage() → Enviar mensagem entre contextos
├── onMessage → Escutar mensagens
└── getURL() → Obter URL de recursos da extensão

• chrome.sidePanel
├── open() → Abrir side panel
├── setOptions() → Configurar comportamento
└── setPanelBehavior() → Definir quando abre

• chrome.contextMenus
├── create() → Criar item de menu
├── update() → Atualizar menu
└── onClicked → Escutar cliques

• chrome.scripting
├── executeScript() → Injetar código JS
└── insertCSS() → Injetar estilos

• chrome.storage
├── local.get() → Ler dados locais
├── local.set() → Salvar dados locais
└── onChanged → Escutar mudanças

• chrome.tabs
├── query() → Buscar abas
├── sendMessage() → Enviar para content script
└── onUpdated → Escutar mudanças em abas

• chrome.notifications
└── create() → Criar notificação do sistema

═══════════════════════════════════════════════════════════════════════
COMPARAÇÃO: SIMULAÇÃO vs REAL
═══════════════════════════════════════════════════════════════════════

┌────────────────────────────┬──────────────────────────────────────┐
│ SIMULAÇÃO (index.js) │ MEET TRACK REAL │
├────────────────────────────┼──────────────────────────────────────┤
│ EventBus (CustomEvents) │ chrome.runtime.sendMessage() │
│ bus.emit('event', data) │ bridge.send('event', data) │
│ bus.on('event', callback) │ bridge.on('event', callback) │
│ Contextos no mesmo escopo │ Contextos isolados │
│ Comunicação síncrona │ Comunicação assíncrona (Promises) │
│ fetch() em qualquer lugar │ fetch() APENAS no background │
│ Estado em variáveis locais │ Pinia stores (reativo) │
│ Sem autenticação │ JWT tokens gerenciados │
└────────────────────────────┴──────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
PONTOS CRÍTICOS
═══════════════════════════════════════════════════════════════════════

⚠️ Content Scripts NÃO PODEM:
• Fazer fetch para APIs externas (blocked by CORS)
• Acessar chrome.storage diretamente
• Gerenciar tokens de autenticação
• Modificar headers HTTP

✅ Apenas Background Script PODE:
• Fazer fetch sem restrições CORS
• Acessar todas as Chrome APIs privilegiadas
• Interceptar e modificar requisições de rede
• Gerenciar autenticação global

🔑 Bridge (Quasar BEX):
• Abstrai comunicação entre Vue App ↔ Background
• Usa chrome.runtime por baixo dos panos
• Suporta requisições/respostas (request/response pattern)
• Permite comunicação bidirecional

📦 Pinia Stores:
• Compartilham estado entre componentes Vue
• Persistem dados localmente (chrome.storage)
• Reagem a broadcasts do background
• Gerenciam histórico de conversas, gravações, etc

═══════════════════════════════════════════════════════════════════════
EXEMPLO REAL - MEET TRACK
═══════════════════════════════════════════════════════════════════════

// src/services/MessagingService.ts (Vue App)
class MessagingService {
async sendMessage(text: string) {
// Envia via bridge para background
const response = await bexBridge.send('chat:send-message', {
text,
agentId: this.currentAgent
});

    // Atualiza store
    this.conversationStore.addMessage(response.data);

}
}

// src-bex/background.ts
bridge.on('chat:send-message', async (payload) => {
// Adiciona token
const token = await getAuthToken();

// Chama API
const response = await fetch(API_URL, {
method: 'POST',
headers: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json'
},
body: JSON.stringify(payload)
});

const data = await response.json();

// Retorna para Vue App
return { success: true, data };
});

// src-bex/content-scripts/selection-capture.ts
document.addEventListener('mouseup', () => {
const text = window.getSelection().toString();
if (!text) return;

// Envia para background
chrome.runtime.sendMessage({
source: 'selection-capture',
action: 'send-to-sidebar',
text
});
});

═══════════════════════════════════════════════════════════════════════
RESUMO FINAL
═══════════════════════════════════════════════════════════════════════

1. Content Script → Background → Vue App (via broadcast)
2. Vue App → Background → API Externa → Background → Vue App
3. Comunicação SEMPRE assíncrona via chrome.runtime
4. Background é o único que pode fazer fetch sem CORS
5. Bridge (Quasar BEX) abstrai complexidade da comunicação
6. Pinia stores gerenciam estado reativo no Vue App

\*/
