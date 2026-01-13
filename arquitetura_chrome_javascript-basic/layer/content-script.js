/**
 * content-script.js
 * Content Script - Injetado na página web (Google Meet, Teams, etc)
 * Captura eventos do usuário e envia para o background
 */

class ContentScript {
  constructor(chromeRuntime) {
    this.runtime = chromeRuntime;
    this.context = 'content';
    
    console.log('🔧 Inicializando CONTENT SCRIPT');
    this.setupListeners();
  }

  /**
   * Registra listeners para receber mensagens
   */
  setupListeners() {
    this.runtime.addListener(this.context, (message) => {
      if (message.type === 'SHOW_NOTIFICATION') {
        console.log(`\n🔔 [CONTENT] Exibindo notificação: "${message.payload}"`);
      }
    });
  }

  /**
   * Captura texto selecionado pelo usuário
   */
  captureText(text) {
    console.log(`\n👆 [CONTENT] Usuário selecionou: "${text}"`);
    
    this.runtime.sendMessage(this.context, {
      type: 'TEXT_SELECTED',
      payload: { text }
    }, (response) => {
      console.log(`✅ [CONTENT] Resposta:`, response);
    });
  }

  /**
   * Inicia gravação de áudio
   */
  startRecording() {
    console.log(`\n🎤 [CONTENT] Iniciando gravação`);
    
    this.runtime.sendMessage(this.context, {
      type: 'START_RECORDING',
      payload: { meetingId: 'meet-123' }
    }, (response) => {
      console.log(`✅ [CONTENT] Gravação iniciada:`, response);
    });
  }

  /**
   * Abre/fecha sidebar
   */
  toggleSidebar() {
    console.log(`\n🔘 [CONTENT] Toggle sidebar`);
    
    this.runtime.sendMessage(this.context, {
      type: 'TOGGLE_SIDEBAR',
      payload: { action: 'open' }
    });
  }
}

module.exports = ContentScript;
