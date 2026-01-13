/**
 * EXEMPLO SIMPLES - Registro e Escuta de Mensagens
 */

console.log("═".repeat(60))
console.log("EXEMPLO: Como funciona o registro de mensagens")
console.log("═".repeat(60))

// ============================================================================
// PASSO 1: Criar o mensageiro (ChromeRuntime)
// ============================================================================

class ChromeRuntime {
    constructor() {
        this.listeners = {} // Armazena os listeners
    }

    // Registra quem vai ESCUTAR
    addListener(nome, funcao) {
        this.listeners[nome] = funcao
        console.log(`✅ [${nome}] Registrou listener (pronto para escutar)`)
    }

    // Envia mensagem
    sendMessage(destino, mensagem) {
        console.log(`\n📤 Enviando para [${destino}]: "${mensagem}"`)

        // Chama o listener do destino
        if (this.listeners[destino]) {
            this.listeners[destino](mensagem)
        }
    }
}

// ============================================================================
// PASSO 2: Criar o mensageiro
// ============================================================================

console.log("\n📦 Criando ChromeRuntime...\n")
const chromeRuntime = new ChromeRuntime()

// ============================================================================
// PASSO 3: Registrar quem vai ESCUTAR (antes de enviar!)
// ============================================================================

console.log("🔔 Registrando listeners...\n")

// Background registra listener
chromeRuntime.addListener("background", (mensagem) => {
    console.log(`📥 [BACKGROUND] Recebi: "${mensagem}"`)
})

// Popup registra listener
chromeRuntime.addListener("popup", (mensagem) => {
    console.log(`📥 [POPUP] Recebi: "${mensagem}"`)
})

// ============================================================================
// PASSO 4: ENVIAR mensagens (agora sim!)
// ============================================================================

console.log("\n📨 Enviando mensagens...\n")

// Content envia para background
chromeRuntime.sendMessage("background", "Olá do Content Script!")

// Popup envia para background
chromeRuntime.sendMessage("background", "Preciso de dados")

// Background envia para popup
chromeRuntime.sendMessage("popup", "Aqui estão os dados!")

// ============================================================================
// RESULTADO
// ============================================================================

console.log("\n" + "═".repeat(60))
console.log("💡 EXPLICAÇÃO")
console.log("═".repeat(60))
console.log(`
1. ChromeRuntime = mensageiro (tipo WhatsApp)

2. addListener() = "quero receber mensagens"
   → Deve ser chamado ANTES de enviar mensagens
   → É como dar seu número de telefone

3. sendMessage() = "enviar mensagem"
   → Só funciona se o destinatário já registrou listener
   → É como enviar mensagem no WhatsApp

4. ORDEM CORRETA:
   a) Criar ChromeRuntime
   b) Registrar listeners (addListener)
   c) Enviar mensagens (sendMessage)
`)
