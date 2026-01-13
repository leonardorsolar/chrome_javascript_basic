Aqui vai **o exemplo MAIS SIMPLES possível**, usando apenas **JavaScript puro**, simulando **exatamente** como funciona o envio e recebimento de mensagens na arquitetura do Chrome (content → background → popup).

Sem HTML, sem nada complicado.
Apenas **mensageiro + envio + resposta**.

---

# ✅ **EXEMPLO SUPER SIMPLES — Envio e Resposta (Content ↔ Background)**

```javascript
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
```

---

# 📌 **O que esse exemplo faz?**

1. Simula o **chrome.runtime**
2. Registra um listener chamado `"background"`
3. O content envia:

```
chromeRuntime.sendMessage("background", "Olá!")
```

4. O background recebe e responde
5. A resposta aparece no console

---

# 🧠 **Explicação visual**

```
CONTENT  → (mensagem) →  BACKGROUND
CONTENT  ← (resposta) ←  BACKGROUND
```

---

# 🎉 **Exemplo ainda mais simples (sem resposta)**

```javascript
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
```

---

# Quer um exemplo com 3 partes (content → background → popup)?

Ou um exemplo com **assincronismo (promises)** igual ao Chrome real?
É só pedir!
