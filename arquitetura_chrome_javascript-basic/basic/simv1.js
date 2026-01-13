/**
 * index.js
 * Orquestrador Principal - Simula Arquitetura Chrome Extension
 *
 * Importa e inicializa as 3 camadas:
 * 1. Content Script (content-script.js)
 * 2. Background Script (background.js)
 * 3. Popup/Side Panel (popup.js)
 */

// Importa módulos
const ChromeRuntime = require("./chrome-runtime")
const ContentScript = require("./content-script")
const BackgroundScript = require("./background")
const PopupApp = require("./popup")

console.log("\n╔═══════════════════════════════════════════════════════════╗")
console.log("║  SIMULAÇÃO - ARQUITETURA CHROME EXTENSION                ║")
console.log("║  Sistema de Mensagens entre Camadas                      ║")
console.log("╚═══════════════════════════════════════════════════════════╝\n")

// ============================================================================
// INICIALIZAÇÃO DAS CAMADAS
// ============================================================================

// 1. Cria simulador do chrome.runtime
const chromeRuntime = new ChromeRuntime()

// 2. Inicializa Content Script
const contentScript = new ContentScript(chromeRuntime)

// 3. Inicializa Background Script
const backgroundScript = new BackgroundScript(chromeRuntime)

// 4. Inicializa Popup/Side Panel
const popupApp = new PopupApp(chromeRuntime)

console.log("\n✅ Todas as camadas inicializadas!\n")

// ============================================================================
// SIMULAÇÃO DE CENÁRIOS
// ============================================================================

console.log("═".repeat(70))
console.log("🎬 INICIANDO SIMULAÇÃO DE CENÁRIOS")
console.log("═".repeat(70))

// CENÁRIO 1: Usuário seleciona texto na página
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 1: Seleção de Texto")
    console.log("─".repeat(70))
    contentScript.captureText("Discussão sobre Q4 2024 revenue targets")
}, 500)

// CENÁRIO 2: Usuário seleciona mais texto
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 2: Mais Texto Selecionado")
    console.log("─".repeat(70))
    contentScript.captureText("Action items: John to prepare slides")
}, 1500)

// CENÁRIO 3: Usuário envia mensagem no chat (Vue App)
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 3: Enviar Mensagem no Chat")
    console.log("─".repeat(70))
    popupApp.sendChatMessage("Resuma os pontos principais discutidos")
}, 2500)

// CENÁRIO 4: Usuário inicia gravação
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 4: Iniciar Gravação")
    console.log("─".repeat(70))
    contentScript.startRecording()
}, 3500)

// CENÁRIO 5: Usuário salva reunião (Vue App)
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 5: Salvar Reunião")
    console.log("─".repeat(70))
    popupApp.saveMeeting()
}, 4500)

// CENÁRIO 6: Toggle sidebar
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 6: Toggle Sidebar")
    console.log("─".repeat(70))
    contentScript.toggleSidebar()
}, 5500)

// ============================================================================
// RESUMO FINAL
// ============================================================================

setTimeout(() => {
    const stats = popupApp.getStats()

    console.log("\n" + "═".repeat(70))
    console.log("✅ SIMULAÇÃO COMPLETA!")
    console.log("═".repeat(70))

    console.log("\n📊 Estatísticas:")
    console.log(`   • Textos capturados: ${stats.capturedTexts}`)
    console.log(`   • Mensagens no chat: ${stats.messages}`)

    console.log("\n📚 Estrutura do Projeto:")
    console.log("   ├── chrome-runtime.js   → Simula chrome.runtime API")
    console.log("   ├── content-script.js   → Captura eventos da página")
    console.log("   ├── background.js       → Processa mensagens e chama APIs")
    console.log("   ├── popup.js            → Interface Vue (Side Panel)")
    console.log("   └── index.js            → Orquestrador principal")

    console.log("\n💡 Fluxo de Mensagens:")
    console.log("   1. Content Script captura evento")
    console.log("   2. Envia para Background via chrome.runtime.sendMessage()")
    console.log("   3. Background processa e faz broadcast")
    console.log("   4. Popup recebe broadcast e atualiza UI")
    console.log(
        "   5. Popup envia ação → Background executa → retorna resultado"
    )

    console.log("\n🎯 Principais Diferenças entre as Camadas:")
    console.log("   • Content Script: Acessa DOM, NÃO pode fazer fetch")
    console.log("   • Background: Sem DOM, PODE fazer fetch sem CORS")
    console.log("   • Popup: Interface Vue, recebe broadcasts, gerencia estado")

    console.log("\n")
}, 6500)
