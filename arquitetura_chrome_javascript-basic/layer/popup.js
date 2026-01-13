/**
 * popup.js
 * Popup / Side Panel (Vue App)
 * Interface gráfica da extensão
 */

class PopupApp {
  constructor(chromeRuntime) {
    this.runtime = chromeRuntime;
    this.context = 'popup';
    this.capturedTexts = [];
    this.messages = [];
    
    console.log('🔧 Inicializando POPUP/SIDE PANEL');
    this.setupListeners();
  }

  /**
   * Registra listeners para receber broadcasts
   */
  setupListeners() {
    this.runtime.addListener(this.context, (message) => {
      console.log(`\n📥 [POPUP] Recebeu: ${message.type}`);

      switch (message.type) {
        case 'TEXT_CAPTURED':
          this.onTextCaptured(message.payload);
          break;
        
        case 'CHAT_RESPONSE':
          this.onChatResponse(message.payload);
          break;
        
        case 'SHOW_NOTIFICATION':
          console.log(`   🔔 Notificação: "${message.payload}"`);
          break;
      }
    });
  }

  /**
   * Quando texto é capturado
   */
  onTextCaptured(payload) {
    console.log(`   ✅ Texto capturado: "${payload.text}"`);
    this.capturedTexts.push(payload.text);
    console.log(`   Total de textos: ${this.capturedTexts.length}`);
  }

  /**
   * Quando IA responde
   */
  onChatResponse(payload) {
    console.log(`   💬 Resposta da IA recebida`);
    this.messages.push({
      role: 'assistant',
      content: payload.text
    });
  }

  /**
   * Usuário envia mensagem no chat
   */
  sendChatMessage(text) {
    console.log(`\n✍️  [POPUP] Enviando mensagem: "${text}"`);
    
    this.messages.push({ role: 'user', content: text });
    
    this.runtime.sendMessage(this.context, {
      type: 'SEND_CHAT_MESSAGE',
      payload: { text, agentId: 'gpt-4' }
    }, (response) => {
      console.log(`✅ [POPUP] Confirmação:`, response);
    });
  }

  /**
   * Usuário salva reunião
   */
  saveMeeting() {
    console.log(`\n💾 [POPUP] Salvando reunião`);
    
    this.runtime.sendMessage(this.context, {
      type: 'SAVE_MEETING',
      payload: { texts: this.capturedTexts, timestamp: Date.now() }
    }, (response) => {
      console.log(`✅ [POPUP] Reunião salva: ${response.meetingId}`);
      this.capturedTexts = [];
    });
  }

  /**
   * Obtém estatísticas
   */
  getStats() {
    return {
      capturedTexts: this.capturedTexts.length,
      messages: this.messages.length
    };
  }
}

module.exports = PopupApp;
