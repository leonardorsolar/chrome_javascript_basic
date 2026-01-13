const bus = {
    listeners: {},

    listen(nome, fn) {
        this.listeners[nome] = fn
    },

    send(nome, msg) {
        this.listeners[nome]?.(msg)
    },
}

bus.listen("background", (msg) => {
    console.log("BACKGROUND recebeu:", msg)
})

bus.send("background", "Hello!")
