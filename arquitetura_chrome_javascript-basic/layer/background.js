/**
 * background.js
 * Background Script (Service Worker)
 * Gerencia comunicação, autenticação e chamadas à API
 */

class BackgroundScript {
  constructor(chromeRuntime) {
    this.runtime = chromeRuntime;
    this.context = 'background';
    this.authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    console.log('🔧 Inicializando BACKGROUND SCRIPT');
    this.setupListeners();
  }

  /**
   * Registra listener principal de mensagens
   */
  setupListeners() {
    this.runtime.addListener(this.context, (message, sender, sendResponse) => {
      console.log(`\n📥 [BACKGROUND] Recebeu de ${sender.from}: ${message.type}`);

      switch (message.type) {
        case 'TEXT_SELECTED':
          this.handleTextSelected(message, sendResponse);
          break;
        
        case 'SEND_CHAT_MESSAGE':
          this.handleChatMessage(message, sendResponse);
          break;
        
        case 'START_RECORDING':
          this.handleStartRecording(message, sendResponse);
          break;
        
        case 'SAVE_MEETING':
          this.handleSaveMeeting(message, sendResponse);
          break;
        
        case 'TOGGLE_SIDEBAR':
          this.handleToggleSidebar(message, sendResponse);
          break;
      }
    });
  }

  /**
   * Handler: Texto selecionado
   */
  handleTextSelected(message, sendResponse) {
    // Broadcast para todos os contextos
    this.runtime.broadcast(this.context, {
      type: 'TEXT_CAPTURED',
      payload: message.payload
    });
    
    sendResponse({ success: true, message: 'Texto enviado para sidebar' });
  }

  /**
   * Handler: Enviar mensagem para IA
   */
  handleChatMessage(message, sendResponse) {
    console.log(`   💬 Enviando para IA: "${message.payload.text}"`);
    
    // Simula chamada à API
    setTimeout(() => {
      const response = {
        id: `msg-${Date.now()}`,
        text: `Resposta da IA para: ${message.payload.text}`
      };
      
      this.runtime.broadcast(this.context, {
        type: 'CHAT_RESPONSE',
        payload: response
      });
      
      sendResponse({ success: true, data: response });
    }, 200);
  }

  /**
   * Handler: Iniciar gravação
   */
  handleStartRecording(message, sendResponse) {
    const recordingId = `rec-${Date.now()}`;
    
    this.runtime.broadcast(this.context, {
      type: 'SHOW_NOTIFICATION',
      payload: 'Gravação iniciada'
    });
    
    sendResponse({ success: true, recordingId });
  }

  /**
   * Handler: Salvar reunião
   */
  handleSaveMeeting(message, sendResponse) {
    console.log(`   💾 Salvando ${message.payload.texts.length} textos`);
    
    sendResponse({ 
      success: true, 
      meetingId: `meeting-${Date.now()}` 
    });
  }

  /**
   * Handler: Toggle sidebar
   */
  handleToggleSidebar(message, sendResponse) {
    console.log(`   🔀 Abrindo side panel`);
    sendResponse({ success: true });
  }

  /**
   * Simula chamada à API externa
   */
  async callAPI(endpoint, data) {
    console.log(`   🌐 Chamando API: ${endpoint}`);
    console.log(`   🔑 Auth: ${this.authToken.substring(0, 30)}...`);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      id: `api-${Date.now()}`,
      success: true,
      data: data
    };
  }
}

module.exports = BackgroundScript;
