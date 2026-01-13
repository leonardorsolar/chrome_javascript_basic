/**
 * index.js
 * Arquivo principal - Orquestra a simulação da Chrome Extension
 */

// Importa módulos
const ChromeRuntime = require("./chrome-runtime")
const ContentScript = require("./content-script")
const BackgroundScript = require("./background")
const PopupApp = require("./popup")

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

console.log("\n═".repeat(70))
console.log("🚀 SIMULAÇÃO - ARQUITETURA CHROME EXTENSION")
console.log("═".repeat(70))
console.log("\n📦 Carregando módulos...\n")

// Instancia o runtime (simula chrome.runtime)
const chromeRuntime = new ChromeRuntime()
//ChromeRuntime é uma simulação da API chrome.runtime do navegador Chrome.
//No navegador real:
//chrome.runtime.sendMessage(...)      // Envia mensagem
//chrome.runtime.onMessage.addListener(...) // Escuta mensagens

// Instancia os 3 contextos da extensão
const contentScript = new ContentScript(chromeRuntime)
const backgroundScript = new BackgroundScript(chromeRuntime)
const popupApp = new PopupApp(chromeRuntime)

console.log("\n✅ Todos os módulos carregados!\n")

// ============================================================================
// SIMULAÇÃO DE CENÁRIOS
// ============================================================================

console.log("═".repeat(70))
console.log("🎬 INICIANDO CENÁRIOS DE USO")
console.log("═".repeat(70))

// Cenário 1: Usuário seleciona texto na página
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 1: Seleção de Texto")
    console.log("─".repeat(70))
    contentScript.captureText("Discussão sobre Q4 2024 revenue targets")
}, 500)

// Cenário 2: Usuário seleciona mais texto
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 2: Mais Texto Selecionado")
    console.log("─".repeat(70))
    contentScript.captureText("Action items: John to prepare slides")
}, 1500)

// Cenário 3: Usuário envia mensagem no chat
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 3: Enviar Mensagem no Chat")
    console.log("─".repeat(70))
    popupApp.sendChatMessage("Resuma os pontos principais")
}, 2500)

// Cenário 4: Usuário inicia gravação
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 4: Iniciar Gravação")
    console.log("─".repeat(70))
    contentScript.startRecording()
}, 3500)

// Cenário 5: Usuário salva reunião
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 5: Salvar Reunião")
    console.log("─".repeat(70))
    popupApp.saveMeeting()
}, 4500)

// Resumo final
setTimeout(() => {
    const stats = popupApp.getStats()

    console.log("\n" + "═".repeat(70))
    console.log("✅ SIMULAÇÃO COMPLETA")
    console.log("═".repeat(70))
    console.log("\n📊 Estatísticas:")
    console.log(`   • Textos capturados: ${stats.capturedTexts}`)
    console.log(`   • Mensagens no chat: ${stats.messages}`)

    console.log("\n💡 Arquitetura:")
    console.log("   ┌─────────────────┐")
    console.log("   │  Content Script │  → Captura eventos da página")
    console.log("   └────────┬────────┘")
    console.log("            │ chrome.runtime.sendMessage()")
    console.log("            ↓")
    console.log("   ┌─────────────────┐")
    console.log("   │   Background    │  → Processa e faz broadcast")
    console.log("   └────────┬────────┘")
    console.log("            │ chrome.runtime.sendMessage()")
    console.log("            ↓")
    console.log("   ┌─────────────────┐")
    console.log("   │   Popup/Vue App │  → Atualiza interface")
    console.log("   └─────────────────┘")

    console.log("\n🔑 Pontos-chave:")
    console.log("   • Content Script → NÃO acessa APIs (CORS)")
    console.log("   • Background → Único que chama APIs externas")
    console.log("   • Popup/Vue → Interface reativa (Pinia stores)")
    console.log("   • Comunicação sempre via chrome.runtime\n")
}, 5500)
