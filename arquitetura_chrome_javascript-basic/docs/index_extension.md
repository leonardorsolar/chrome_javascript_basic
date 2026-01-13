/\*\*

-   LINHA DO TEMPO - Como funciona o registro
    \*/

console.log(`
═══════════════════════════════════════════════════════════════════════
LINHA DO TEMPO
═══════════════════════════════════════════════════════════════════════

⏱️ TEMPO AÇÃO ESTADO
────────────────────────────────────────────────────────────────────────

T0 📦 const chromeRuntime = new ChromeRuntime()
listeners = {}
↓

T1 🔔 Background registra listener listeners = {
chromeRuntime.addListener() background: [função]
}
↓

T2 🔔 Popup registra listener listeners = {
chromeRuntime.addListener() background: [função],
popup: [função]
}
↓

T3 📤 Content envia mensagem chromeRuntime.sendMessage()
"Olá para background"  
 ↓
Procura: listeners['background']
✅ Achou! Chama a função
↓

T4 📥 Background recebe console.log('Recebi!')

═══════════════════════════════════════════════════════════════════════
ANALOGIA: TELEFONE
═══════════════════════════════════════════════════════════════════════

❌ ORDEM ERRADA:

1. Você liga para João → ❌ Não funciona!
2. João compra telefone → (tarde demais)

✅ ORDEM CERTA:

1. João compra telefone → ✅ Pronto para receber ligações
2. Você liga para João → ✅ Funciona!

═══════════════════════════════════════════════════════════════════════
NO CÓDIGO
═══════════════════════════════════════════════════════════════════════

❌ ORDEM ERRADA:

contentScript.captureText('Hello'); // ❌ Ninguém está escutando!

new BackgroundScript(chromeRuntime); // Registra listener tarde

✅ ORDEM CERTA:

new BackgroundScript(chromeRuntime); // ✅ Registra listener ANTES

contentScript.captureText('Hello'); // ✅ Agora alguém escuta!

═══════════════════════════════════════════════════════════════════════
RESUMO EM 3 PONTOS
═══════════════════════════════════════════════════════════════════════

1️⃣ addListener() = "Estou pronto para receber"
→ Registra ANTES de enviar mensagens
→ É executado no construtor de cada classe

2️⃣ sendMessage() = "Enviar mensagem agora"
→ Só funciona se alguém já chamou addListener()
→ Procura no objeto listeners[destino]

3️⃣ ORDEM IMPORTA:
✅ Registrar → Enviar
❌ Enviar → Registrar (não funciona!)

═══════════════════════════════════════════════════════════════════════
`);
