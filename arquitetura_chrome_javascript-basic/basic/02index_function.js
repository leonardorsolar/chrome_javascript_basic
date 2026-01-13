// ========================================================
// SISTEMA DE MENSAGENS SUPER SIMPLES
// ========================================================
const bus = {
    listeners: {},

    // Registra um listener (uma função que escuta)
    listen(nome, fn) {
        this.listeners[nome] = fn
        console.log(`📌 Listener "${nome}" registrado!`)
    },

    // Envia uma mensagem para o listener com aquele nome
    send(nome, msg) {
        console.log(`📤 Enviando para "${nome}":`, msg)
        this.listeners[nome]?.(msg) // executa a função guardada
    },
}

// ========================================================
// 1) REGISTRAR 2 LISTENERS DIFERENTES
// ========================================================

// Listener 1 -------------------------
bus.listen("background", (msg) => {
    console.log("🎧 [BACKGROUND] recebeu:", msg)
})

// Listener 2 -------------------------
bus.listen("popup", (msg) => {
    console.log("🎧 [POPUP] recebeu:", msg)
})

// ========================================================
// 2) ENVIAR MENSAGENS PARA OS DOIS
// ========================================================

bus.send("background", "Olá, Background!")
bus.send("popup", "Oi Popup! Tudo bem?")
