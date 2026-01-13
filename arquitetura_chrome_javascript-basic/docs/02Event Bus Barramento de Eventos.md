# 🚌 Event Bus (Barramento de Eventos)

## O que é

**Event Bus** = Um "mensageiro central" que conecta diferentes partes do código.

É como um **quadro de avisos** onde:

-   Você **prega** seu nome e telefone (listen)
-   Alguém **procura** seu nome e te liga (send)

---

## Como funciona esse código

```javascript
const bus = {
    listeners: {}, // 📋 Lista de telefones

    listen(nome, fn) {
        // 📝 "Anote meu número"
        this.listeners[nome] = fn
    },

    send(nome, msg) {
        // 📞 "Ligue para essa pessoa"
        this.listeners[nome]?.(msg)
    },
}
```

### Passo a passo:

```javascript
// 1️⃣ Background diz: "Se alguém me chamar, faça isso:"
bus.listen("background", (msg) => {
    console.log("BACKGROUND recebeu:", msg)
})

// Agora o bus sabe:
// listeners = {
//     "background": função que imprime a mensagem
// }

// 2️⃣ Alguém envia mensagem para "background"
bus.send("background", "Hello!")

// Bus procura: listeners["background"]
// Achou! Executa a função com "Hello!"
// Resultado: "BACKGROUND recebeu: Hello!"
```

---

## 📊 Diagrama Visual

```
┌─────────────────────────────────────────┐
│           EVENT BUS                     │
│                                         │
│  listeners = {                          │
│    "background": [função],              │
│    "popup": [função],                   │
│    "content": [função]                  │
│  }                                      │
│                                         │
└─────────────────────────────────────────┘
         ↑                    ↓
         │                    │
    listen()              send()
    "Me inscrever"        "Enviar para"
         │                    │
         │                    │
    ┌────┴────┐         ┌────┴────┐
    │ POPUP   │         │ CONTENT │
    └─────────┘         └─────────┘
```

---

## 🎯 Analogias Simples

### 1. Rádio 📻

```javascript
bus.listen("radio-rock", tocarMusica) // Sintonizar estação
bus.send("radio-rock", "Bohemian Rhapsody") // Transmitir música
```

### 2. WhatsApp de Grupos 💬

```javascript
bus.listen("grupo-família", lerMensagem) // Entrar no grupo
bus.send("grupo-família", "Oi pessoal!") // Enviar mensagem
```

### 3. Caixa de Correio 📬

```javascript
bus.listen("João", receberCarta) // Colocar nome na caixa
bus.send("João", "Conta de luz") // Carteiro entrega
```

---

## Por que usar?

### ❌ SEM Event Bus (acoplado):

```javascript
// Background precisa conhecer Popup diretamente
function background() {
    popup.mostrarMensagem("Hello") // ❌ Dependência direta
}
```

### ✅ COM Event Bus (desacoplado):

```javascript
// Background só conhece o bus
function background() {
    bus.send("popup", "Hello") // ✅ Não sabe quem é popup
}

// Popup se inscreve sozinho
bus.listen("popup", (msg) => mostrarMensagem(msg))
```

---

## 📦 Resumo em 3 frases

1. **Event Bus** = Mensageiro central que conecta componentes
2. **listen()** = "Me avise quando alguém me chamar"
3. **send()** = "Chame essa pessoa com essa mensagem"

**Tipo de arquitetura:** **Pub/Sub** (Publisher/Subscriber) ou **Observer Pattern**

É como um **WhatsApp de grupos** - você entra no grupo (listen) e recebe mensagens (send)! 💬
