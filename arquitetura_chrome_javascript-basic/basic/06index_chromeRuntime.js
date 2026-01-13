/**
 * SIMULAÇÃO SIMPLES - ARQUITETURA CHROME EXTENSION
 * Demonstra o fluxo de mensagens entre Content Script, Background e Popup
 */

// ============================================================================
// SIMULADOR DO chrome.runtime (MessageBus)
// ============================================================================
const chromeRuntime = {
    listeners: {
        background: [],
        content: [],
        popup: [],
    },

    // chrome.runtime.sendMessage()
    sendMessage(from, message, callback) {
        console.log(`\n📤 [${from.toUpperCase()}] → [BACKGROUND]`)
        console.log(`   Tipo: ${message.type}`)
        console.log(`   Payload:`, message.payload)

        setTimeout(() => {
            this.listeners.background.forEach((listener) => {
                listener(message, { from }, callback)
            })
        }, 50)
    },

    // chrome.runtime.onMessage.addListener()
    addListener(context, callback) {
        this.listeners[context].push(callback)
    },

    // Broadcast (background envia para todos)
    broadcast(from, message) {
        console.log(
            `\n📢 [${from.toUpperCase()}] Broadcasting: ${message.type}`
        )

        Object.keys(this.listeners).forEach((context) => {
            if (context !== from) {
                setTimeout(() => {
                    this.listeners[context].forEach((listener) => {
                        listener(message)
                    })
                }, 100)
            }
        })
    },
}

// ============================================================================
// CONTENT SCRIPT
// ============================================================================
console.log("\n🔧 Inicializando CONTENT SCRIPT")

// Registra listener
chromeRuntime.addListener("content", (message) => {
    if (message.type === "SHOW_NOTIFICATION") {
        console.log(`\n🔔 [CONTENT] Exibindo notificação: "${message.payload}"`)
    }
})

// Simula captura de texto
function captureText(text) {
    console.log(`\n👆 [CONTENT] Usuário selecionou: "${text}"`)

    chromeRuntime.sendMessage(
        "content",
        {
            type: "TEXT_SELECTED",
            payload: { text },
        },
        (response) => {
            console.log(`✅ [CONTENT] Resposta:`, response)
        }
    )
}

// Simula iniciar gravação
function startRecording() {
    console.log(`\n🎤 [CONTENT] Iniciando gravação`)

    chromeRuntime.sendMessage(
        "content",
        {
            type: "START_RECORDING",
            payload: { meetingId: "meet-123" },
        },
        (response) => {
            console.log(`✅ [CONTENT] Gravação iniciada:`, response)
        }
    )
}

// ============================================================================
// BACKGROUND SCRIPT
// ============================================================================
console.log("🔧 Inicializando BACKGROUND SCRIPT")

// Registra listener
chromeRuntime.addListener("background", (message, sender, sendResponse) => {
    console.log(`\n📥 [BACKGROUND] Recebeu de ${sender.from}: ${message.type}`)

    if (message.type === "TEXT_SELECTED") {
        // Broadcast para todos
        chromeRuntime.broadcast("background", {
            type: "TEXT_CAPTURED",
            payload: message.payload,
        })

        sendResponse({ success: true, message: "Texto enviado para sidebar" })
    }

    if (message.type === "SEND_CHAT_MESSAGE") {
        console.log(`   💬 Enviando para IA: "${message.payload.text}"`)

        // Simula chamada à API
        setTimeout(() => {
            const response = {
                id: `msg-${Date.now()}`,
                text: `Resposta da IA para: ${message.payload.text}`,
            }

            chromeRuntime.broadcast("background", {
                type: "CHAT_RESPONSE",
                payload: response,
            })

            sendResponse({ success: true, data: response })
        }, 200)
    }

    if (message.type === "START_RECORDING") {
        const recordingId = `rec-${Date.now()}`

        chromeRuntime.broadcast("background", {
            type: "SHOW_NOTIFICATION",
            payload: "Gravação iniciada",
        })

        sendResponse({ success: true, recordingId })
    }

    if (message.type === "SAVE_MEETING") {
        console.log(`   💾 Salvando ${message.payload.texts.length} textos`)

        sendResponse({
            success: true,
            meetingId: `meeting-${Date.now()}`,
        })
    }
})

// ============================================================================
// POPUP / SIDE PANEL (Vue App)
// ============================================================================
console.log("🔧 Inicializando POPUP/SIDE PANEL\n")

let capturedTexts = []
let messages = []

// Registra listener
chromeRuntime.addListener("popup", (message) => {
    console.log(`\n📥 [POPUP] Recebeu: ${message.type}`)

    if (message.type === "TEXT_CAPTURED") {
        console.log(`   ✅ Texto capturado: "${message.payload.text}"`)
        capturedTexts.push(message.payload.text)
        console.log(`   Total de textos: ${capturedTexts.length}`)
    }

    if (message.type === "CHAT_RESPONSE") {
        console.log(`   💬 Resposta da IA recebida`)
        messages.push({
            role: "assistant",
            content: message.payload.text,
        })
    }
})

// Usuário envia mensagem no chat
function sendChatMessage(text) {
    console.log(`\n✍️  [POPUP] Enviando mensagem: "${text}"`)

    messages.push({ role: "user", content: text })

    chromeRuntime.sendMessage(
        "popup",
        {
            type: "SEND_CHAT_MESSAGE",
            payload: { text, agentId: "gpt-4" },
        },
        (response) => {
            console.log(`✅ [POPUP] Confirmação:`, response)
        }
    )
}

// Usuário salva reunião
function saveMeeting() {
    console.log(`\n💾 [POPUP] Salvando reunião`)

    chromeRuntime.sendMessage(
        "popup",
        {
            type: "SAVE_MEETING",
            payload: { texts: capturedTexts, timestamp: Date.now() },
        },
        (response) => {
            console.log(`✅ [POPUP] Reunião salva: ${response.meetingId}`)
            capturedTexts = []
        }
    )
}

// ============================================================================
// SIMULAÇÃO DE EVENTOS
// ============================================================================
console.log("═".repeat(70))
console.log("🎬 INICIANDO SIMULAÇÃO")
console.log("═".repeat(70))

// Cenário 1: Usuário seleciona texto
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 1: Seleção de Texto")
    console.log("─".repeat(70))
    captureText("Discussão sobre Q4 2024 revenue targets")
}, 500)

// Cenário 2: Mais texto
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 2: Mais Texto")
    console.log("─".repeat(70))
    captureText("Action items: John to prepare slides")
}, 1500)

// Cenário 3: Enviar mensagem no chat
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 3: Enviar Mensagem no Chat")
    console.log("─".repeat(70))
    sendChatMessage("Resuma os pontos principais")
}, 2500)

// Cenário 4: Iniciar gravação
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 4: Iniciar Gravação")
    console.log("─".repeat(70))
    startRecording()
}, 3500)

// Cenário 5: Salvar reunião
setTimeout(() => {
    console.log("\n" + "─".repeat(70))
    console.log("CENÁRIO 5: Salvar Reunião")
    console.log("─".repeat(70))
    saveMeeting()
}, 4500)

// Resumo final
setTimeout(() => {
    console.log("\n" + "═".repeat(70))
    console.log("✅ SIMULAÇÃO COMPLETA")
    console.log("═".repeat(70))
    console.log("\n📊 Resumo:")
    console.log(`   • Textos capturados: ${capturedTexts.length}`)
    console.log(`   • Mensagens no chat: ${messages.length}`)
    console.log("\n💡 Fluxo principal:")
    console.log("   1. Content Script captura evento → envia para Background")
    console.log("   2. Background processa → faz broadcast para Popup")
    console.log("   3. Popup atualiza UI")
    console.log(
        "   4. Popup envia ação → Background executa → retorna resultado\n"
    )
}, 5500)
