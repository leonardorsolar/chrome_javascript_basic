/**
 * chrome-runtime.js
 * Simula a API chrome.runtime (sendMessage, onMessage, etc)
 */

class ChromeRuntime {
  constructor() {
    this.listeners = {
      background: [],
      content: [],
      popup: []
    };
  }

  /**
   * chrome.runtime.sendMessage()
   */
  sendMessage(from, message, callback) {
    console.log(`\n📤 [${from.toUpperCase()}] → [BACKGROUND]`);
    console.log(`   Tipo: ${message.type}`);
    console.log(`   Payload:`, message.payload);

    setTimeout(() => {
      this.listeners.background.forEach(listener => {
        listener(message, { from }, callback);
      });
    }, 50);
  }

  /**
   * chrome.runtime.onMessage.addListener()
   */
  addListener(context, callback) {
    this.listeners[context].push(callback);
  }

  /**
   * Broadcast (background envia para todos os contextos)
   */
  broadcast(from, message) {
    console.log(`\n📢 [${from.toUpperCase()}] Broadcasting: ${message.type}`);
    
    Object.keys(this.listeners).forEach(context => {
      if (context !== from) {
        setTimeout(() => {
          this.listeners[context].forEach(listener => {
            listener(message);
          });
        }, 100);
      }
    });
  }
}

module.exports = ChromeRuntime;
