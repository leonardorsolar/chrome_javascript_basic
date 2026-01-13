/**
 * ========================================================================
 * SIMULAÇÃO DA ARQUITETURA CHROME EXTENSION - SISTEMA DE MENSAGENS
 * ========================================================================
 * 
 * Este código simula os 3 contextos isolados de uma Chrome Extension:
 * 1. CONTENT SCRIPT - Injetado na página web
 * 2. BACKGROUND SCRIPT - Service Worker (Manifest V3)
 * 3. POPUP/SIDE PANEL - Interface Vue App
 * 
 * Cada contexto tem seu próprio escopo e se comunica via chrome.runtime
 */

console.log('\n🚀 INICIANDO SIMULAÇÃO DA ARQUITETURA CHROME EXTENSION\n');
console.log('═'.repeat(70));

// ============================================================================
// SIMULAÇÃO DO CHROME RUNTIME API
// ============================================================================

class ChromeRuntimeSimulator {
  constructor() {
    this.listeners = {
      background: [],
      content: [],
      popup: []
    };
  }

  /**
   * Simula chrome.runtime.sendMessage()
   * Envia mensagem de um contexto para outro
   */
  sendMessage(from, message, callback) {
    console.log(`\n📤 [${from.toUpperCase()}] Enviando mensagem:`);
    console.log(`   Tipo: ${message.type}`);
    console.log(`   Payload:`, message.payload || message);
    
    // Mensagens sempre vão para o BACKGROUND primeiro
    const target = 'background';
    
    // Simula delay de rede (assíncrono)
    setTimeout(() => {
      console.log(`\n📥 [${target.toUpperCase()}] Recebeu mensagem de ${from}`);
      
      // Chama todos os listeners do background
      this.listeners[target].forEach(listener => {
        const response = listener(message, { from }, (resp) => {
          // sendResponse callback
          if (callback) {
            console.log(`\n📨 [${target.toUpperCase()}] Enviando resposta para ${from}:`);
            console.log(`   `, resp);
            callback(resp);
          }
        });
        
        // Se retornou um valor direto (não usou sendResponse)
        if (response && callback) {
          console.log(`\n📨 [${target.toUpperCase()}] Enviando resposta para ${from}:`);
          console.log(`   `, response);
          callback(response);
        }
      });
    }, 100);
  }

  /**
   * Simula chrome.runtime.onMessage.addListener()
   * Registra listener para receber mensagens
   */
  addListener(context, callback) {
    console.log(`🔔 [${context.toUpperCase()}] Registrou listener de mensagens`);
    this.listeners[context].push(callback);
  }

  /**
   * Simula broadcast do background para todos os contextos
   */
  broadcast(from, message) {
    console.log(`\n📢 [${from.toUpperCase()}] Broadcasting mensagem:`);
    console.log(`   `, message);
    
    // Envia para todos os contextos exceto o próprio
    Object.keys(this.listeners).forEach(context => {
      if (context !== from) {
        setTimeout(() => {
          console.log(`\n📥 [${context.toUpperCase()}] Recebeu broadcast:`);
          console.log(`   `, message);
          
          this.listeners[context].forEach(listener => {
            listener(message);
          });
        }, 150);
      }
    });
  }
}

const chromeRuntime = new ChromeRuntimeSimulator();

// ============================================================================
// CONTEXTO 1: CONTENT SCRIPT
// ============================================================================
// Injetado na página web (exemplo: Google Meet)
// - Captura interações do usuário (cliques, seleção de texto)
// - Injeta UI (botão flutuante, modais)
// - NÃO pode acessar APIs externas (CORS)
// - Comunica com background via chrome.runtime.sendMessage
// ============================================================================

class ContentScript {
  constructor() {
    this.context = 'content';
    console.log('\n📄 [CONTENT SCRIPT] Inicializado');
    this.setupListeners();
  }

  setupListeners() {
    // Registra listener para receber mensagens do background
    chromeRuntime.addListener(this.context, (message) => {
      if (message.type === 'SHOW_NOTIFICATION') {
        this.showNotification(message.payload);
      }
      if (message.type === 'UPDATE_UI') {
        this.updateUI(message.payload);
      }
    });
  }

  /**
   * Simula captura de texto selecionado pelo usuário
   */
  captureTextSelection(text) {
    console.log(`\n👆 [CONTENT SCRIPT] Usuário selecionou texto: "${text}"`);
    
    chromeRuntime.sendMessage(this.context, {
      type: 'TEXT_SELECTED',
      payload: {
        text: text,
        url: 'https://meet.google.com/xyz-meeting',
        timestamp: new Date().toISOString()
      }
    }, (response) => {
      console.log(`✅ [CONTENT SCRIPT] Resposta recebida:`, response);
    });
  }

  /**
   * Simula clique no botão flutuante
   */
  toggleSidebar() {
    console.log(`\n🔘 [CONTENT SCRIPT] Usuário clicou no botão flutuante`);
    
    chromeRuntime.sendMessage(this.context, {
      type: 'TOGGLE_SIDEBAR',
      payload: { action: 'open' }
    });
  }

  /**
   * Simula início de gravação de áudio
   */
  startRecording() {
    console.log(`\n🎤 [CONTENT SCRIPT] Iniciando gravação de áudio`);
    
    chromeRuntime.sendMessage(this.context, {
      type: 'START_RECORDING',
      payload: {
        meetingId: 'meet-123',
        platform: 'google-meet'
      }
    }, (response) => {
      if (response.success) {
        console.log(`✅ [CONTENT SCRIPT] Gravação iniciada com sucesso`);
      }
    });
  }

  showNotification(message) {
    console.log(`\n🔔 [CONTENT SCRIPT] Exibindo notificação: "${message}"`);
  }

  updateUI(data) {
    console.log(`\n🎨 [CONTENT SCRIPT] Atualizando UI:`, data);
  }
}

// ============================================================================
// CONTEXTO 2: BACKGROUND SCRIPT (Service Worker)
// ============================================================================
// - Gerencia ciclo de vida da extensão
// - Intercepta todas as mensagens
// - Tem acesso total às Chrome APIs
// - Pode fazer fetch sem restrições CORS
// - Gerencia autenticação (tokens)
// - Faz broadcast para outros contextos
// ============================================================================

class BackgroundScript {
  constructor() {
    this.context = 'background';
    this.authToken = 'Bearer fake-jwt-token-123';
    this.recordings = new Map();
    console.log('\n⚙️  [BACKGROUND SCRIPT] Inicializado como Service Worker');
    this.setupListeners();
  }

  setupListeners() {
    chromeRuntime.addListener(this.context, (message, sender, sendResponse) => {
      console.log(`\n🔄 [BACKGROUND] Processando mensagem tipo: ${message.type}`);

      switch (message.type) {
        case 'TEXT_SELECTED':
          return this.handleTextSelection(message.payload, sendResponse);
        
        case 'TOGGLE_SIDEBAR':
          return this.handleToggleSidebar(message.payload, sendResponse);
        
        case 'START_RECORDING':
          return this.handleStartRecording(message.payload, sendResponse);
        
        case 'SEND_CHAT_MESSAGE':
          return this.handleChatMessage(message.payload, sendResponse);
        
        case 'SAVE_MEETING':
          return this.handleSaveMeeting(message.payload, sendResponse);
        
        default:
          sendResponse({ error: 'Unknown message type' });
      }
    });
  }

  /**
   * Handler: Texto selecionado
   */
  handleTextSelection(payload, sendResponse) {
    console.log(`📝 [BACKGROUND] Processando texto selecionado`);
    
    // Broadcast para popup/sidebar
    chromeRuntime.broadcast(this.context, {
      type: 'TEXT_CAPTURED',
      payload: payload
    });

    sendResponse({ success: true, message: 'Texto enviado para sidebar' });
  }

  /**
   * Handler: Toggle sidebar
   */
  handleToggleSidebar(payload, sendResponse) {
    console.log(`🔀 [BACKGROUND] Toggle sidebar: ${payload.action}`);
    
    // Abre side panel (Chrome API)
    console.log(`   chrome.sidePanel.open() - Side panel aberto`);
    
    sendResponse({ success: true });
  }

  /**
   * Handler: Iniciar gravação
   */
  handleStartRecording(payload, sendResponse) {
    console.log(`🎙️  [BACKGROUND] Iniciando gravação para meeting: ${payload.meetingId}`);
    
    const recordingId = `rec-${Date.now()}`;
    this.recordings.set(recordingId, {
      meetingId: payload.meetingId,
      startTime: Date.now(),
      chunks: []
    });

    // Notifica content script
    chromeRuntime.broadcast(this.context, {
      type: 'SHOW_NOTIFICATION',
      payload: 'Gravação iniciada'
    });

    sendResponse({ success: true, recordingId });
  }

  /**
   * Handler: Enviar mensagem de chat (para IA)
   */
  async handleChatMessage(payload, sendResponse) {
    console.log(`💬 [BACKGROUND] Enviando mensagem para IA`);
    console.log(`   Texto: "${payload.text}"`);
    
    // Simula chamada à API externa (sem CORS!)
    const response = await this.callExternalAPI('/api/chat', {
      text: payload.text,
      agentId: payload.agentId
    });

    // Broadcast resposta para popup
    chromeRuntime.broadcast(this.context, {
      type: 'CHAT_RESPONSE',
      payload: response
    });

    sendResponse({ success: true, data: response });
  }

  /**
   * Handler: Salvar reunião
   */
  async handleSaveMeeting(payload, sendResponse) {
    console.log(`💾 [BACKGROUND] Salvando reunião`);
    
    const response = await this.callExternalAPI('/api/meetings', payload);
    
    sendResponse({ success: true, meetingId: response.id });
  }

  /**
   * Simula chamada à API externa (apenas background pode fazer!)
   */
  async callExternalAPI(endpoint, data) {
    console.log(`\n🌐 [BACKGROUND] Chamando API externa:`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Auth: ${this.authToken}`);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simula resposta da API
    const mockResponse = {
      id: `api-${Date.now()}`,
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [BACKGROUND] API respondeu:`, mockResponse);
    return mockResponse;
  }
}

// ============================================================================
// CONTEXTO 3: POPUP / SIDE PANEL (Vue App)
// ============================================================================
// - Interface gráfica da extensão
// - Vue 3 + Quasar + TypeScript
// - Comunica com background via bridge
// - Recebe broadcasts de eventos
// - Exibe chat, reuniões, transcrições
// ============================================================================

class VueAppPopup {
  constructor() {
    this.context = 'popup';
    this.messages = [];
    this.capturedTexts = [];
    console.log('\n🎨 [VUE APP] Side Panel inicializado');
    this.setupListeners();
  }

  setupListeners() {
    chromeRuntime.addListener(this.context, (message) => {
      console.log(`\n🎯 [VUE APP] Recebeu evento: ${message.type}`);

      switch (message.type) {
        case 'TEXT_CAPTURED':
          this.onTextCaptured(message.payload);
          break;
        
        case 'CHAT_RESPONSE':
          this.onChatResponse(message.payload);
          break;
        
        default:
          console.log(`   Evento não tratado: ${message.type}`);
      }
    });
  }

  /**
   * Quando texto é capturado na página
   */
  onTextCaptured(payload) {
    console.log(`📋 [VUE APP] Texto capturado adicionado à lista`);
    this.capturedTexts.push(payload.text);
    console.log(`   Total de textos: ${this.capturedTexts.length}`);
    
    // Atualiza UI (Vue reactivity)
    this.renderUI();
  }

  /**
   * Quando IA responde
   */
  onChatResponse(payload) {
    console.log(`💬 [VUE APP] Resposta da IA recebida`);
    this.messages.push({
      role: 'assistant',
      content: payload.data.text
    });
    this.renderUI();
  }

  /**
   * Usuário envia mensagem no chat
   */
  sendChatMessage(text) {
    console.log(`\n✍️  [VUE APP] Usuário digitou mensagem: "${text}"`);
    
    // Adiciona à lista local
    this.messages.push({
      role: 'user',
      content: text
    });

    // Envia para background processar
    chromeRuntime.sendMessage(this.context, {
      type: 'SEND_CHAT_MESSAGE',
      payload: {
        text: text,
        agentId: 'agent-gpt4'
      }
    }, (response) => {
      console.log(`✅ [VUE APP] Mensagem enviada com sucesso`);
    });
  }

  /**
   * Usuário clica em "Salvar Reunião"
   */
  saveMeeting() {
    console.log(`\n💾 [VUE APP] Salvando reunião com ${this.capturedTexts.length} textos`);
    
    chromeRuntime.sendMessage(this.context, {
      type: 'SAVE_MEETING',
      payload: {
        texts: this.capturedTexts,
        timestamp: Date.now()
      }
    }, (response) => {
      console.log(`✅ [VUE APP] Reunião salva: ID ${response.meetingId}`);
      this.capturedTexts = []; // Limpa buffer
    });
  }

  /**
   * Renderiza UI (simulação Vue reactivity)
   */
  renderUI() {
    console.log(`\n🖼️  [VUE APP] UI Atualizada:`);
    console.log(`   - Mensagens: ${this.messages.length}`);
    console.log(`   - Textos capturados: ${this.capturedTexts.length}`);
  }
}

// ============================================================================
// DEMONSTRAÇÃO DO FLUXO COMPLETO
// ============================================================================

console.log('\n' + '═'.repeat(70));
console.log('INICIALIZANDO COMPONENTES DA EXTENSÃO');
console.log('═'.repeat(70));

// Instancia os 3 contextos
const contentScript = new ContentScript();
const backgroundScript = new BackgroundScript();
const vueApp = new VueAppPopup();

console.log('\n' + '═'.repeat(70));
console.log('SIMULANDO INTERAÇÕES DO USUÁRIO');
console.log('═'.repeat(70));

// ============================================================================
// CENÁRIO 1: Usuário seleciona texto na página
// ============================================================================
setTimeout(() => {
  console.log('\n\n' + '─'.repeat(70));
  console.log('CENÁRIO 1: Seleção de Texto');
  console.log('─'.repeat(70));
  contentScript.captureTextSelection('Discussão sobre Q4 2024 revenue targets');
}, 500);

// ============================================================================
// CENÁRIO 2: Usuário seleciona mais texto
// ============================================================================
setTimeout(() => {
  console.log('\n\n' + '─'.repeat(70));
  console.log('CENÁRIO 2: Mais Texto Selecionado');
  console.log('─'.repeat(70));
  contentScript.captureTextSelection('Action items: John to prepare slides');
}, 1500);

// ============================================================================
// CENÁRIO 3: Usuário envia mensagem no chat
// ============================================================================
setTimeout(() => {
  console.log('\n\n' + '─'.repeat(70));
  console.log('CENÁRIO 3: Usuário Envia Mensagem no Chat');
  console.log('─'.repeat(70));
  vueApp.sendChatMessage('Resuma os pontos principais desta reunião');
}, 2500);

// ============================================================================
// CENÁRIO 4: Usuário inicia gravação
// ============================================================================
setTimeout(() => {
  console.log('\n\n' + '─'.repeat(70));
  console.log('CENÁRIO 4: Iniciar Gravação');
  console.log('─'.repeat(70));
  contentScript.startRecording();
}, 3500);

// ============================================================================
// CENÁRIO 5: Usuário salva reunião
// ============================================================================
setTimeout(() => {
  console.log('\n\n' + '─'.repeat(70));
  console.log('CENÁRIO 5: Salvar Reunião');
  console.log('─'.repeat(70));
  vueApp.saveMeeting();
}, 4500);

// ============================================================================
// CENÁRIO 6: Abrir/Fechar Sidebar
// ============================================================================
setTimeout(() => {
  console.log('\n\n' + '─'.repeat(70));
  console.log('CENÁRIO 6: Toggle Sidebar');
  console.log('─'.repeat(70));
  contentScript.toggleSidebar();
}, 5500);

// Mensagem final
setTimeout(() => {
  console.log('\n\n' + '═'.repeat(70));
  console.log('✅ SIMULAÇÃO COMPLETA!');
  console.log('═'.repeat(70));
  console.log('\n📚 RESUMO DOS FLUXOS:\n');
  console.log('1️⃣  Content Script captura evento → Envia para Background');
  console.log('2️⃣  Background processa → Chama API externa (se necessário)');
  console.log('3️⃣  Background faz broadcast → Vue App atualiza UI');
  console.log('4️⃣  Vue App envia ação → Background executa → Retorna resultado');
  console.log('\n🔑 PONTOS-CHAVE:\n');
  console.log('• Content Script: Captura eventos, NÃO pode chamar APIs');
  console.log('• Background: Centraliza comunicação, gerencia tokens, chama APIs');
  console.log('• Vue App: Interface reativa, recebe broadcasts, envia comandos');
  console.log('• Comunicação sempre ASSÍNCRONA via chrome.runtime');
  console.log('\n');
}, 6500);