// ----------------------------------------------------
// 1) Criamos um mini sistema que imita o Chrome.runtime
// ----------------------------------------------------

const chromeRuntime = {
    listeners: {},

    // Quem quiser receber mensagens precisa registrar um listener
    onMessage: {
        addListener(nome, funcao) {
            chromeRuntime.listeners[nome] = funcao
        },
    },

    // Enviar mensagem para alguém
    sendMessage(destino, mensagem) {
        console.log(`📤 Enviado para ${destino}:`, mensagem)

        if (chromeRuntime.listeners[destino]) {
            chromeRuntime.listeners[destino](mensagem, (resposta) => {
                console.log(`📥 Resposta do ${destino}:`, resposta)
            })
        }
    },
}

// ----------------------------------------------------
// 2) BACKGROUND registra o listener (escutando mensagens)
// ----------------------------------------------------
chromeRuntime.onMessage.addListener("background", (msg, sendResponse) => {
    console.log("📩 BACKGROUND recebeu:", msg)

    // Background responde
    sendResponse("Mensagem recebida pelo Background!")
})

// ----------------------------------------------------
// 3) CONTENT envia mensagem para BACKGROUND
// ----------------------------------------------------
chromeRuntime.sendMessage("background", "Olá, eu sou o CONTENT!")

// O que esse exemplo faz?
// Simula o chrome.runtime
// Registra um listener chamado "background"

// O content envia:
// chromeRuntime.sendMessage("background", "Olá!")

// O background recebe e responde
// A resposta aparece no console
