/**
 * EXEMPLO DIDÁTICO – Entendendo LISTENER e SENDMESSAGE
 * (Simulação da arquitetura do Chrome)
 */

console.log("============= INÍCIO DO EXEMPLO ==================\n")

// Criamos um "Correio" — ele sabe entregar mensagens
class Correio {
    constructor() {
        this.caixasPostais = {} // Aqui ficam os listeners
    }
    //Listeners são funções que ficam “escutando” algum evento.
    //Elas não rodam sozinhas — elas só são executadas quando algo acontece.

    // Registrar quem quer receber mensagens
    registrarCaixaPostal(nome, funcao) {
        this.caixasPostais[nome] = funcao
        console.log(
            `📮 ${nome} agora tem uma caixa postal! (listener registrado)`
        )
    }

    // Enviar mensagem para alguém
    enviarPara(destinatario, mensagem) {
        console.log(
            `\n📤 Enviando mensagem para ${destinatario}: "${mensagem}"`
        )

        const caixa = this.caixasPostais[destinatario]
        if (caixa) caixa(mensagem)
        else console.log(`❌ ${destinatario} não tem listener registrado!`)
    }
}

// Criamos o correio
console.log("\n📦 Iniciando o sistema de mensagens...\n")
const correio = new Correio()

// Registrar ouvintes (listeners)
console.log("🔔 Registrando caixas postais...\n")

correio.registrarCaixaPostal("Ana", (msg) => {
    console.log(`📥 [ANA] recebeu: "${msg}"`)
})

correio.registrarCaixaPostal("Bruno", (msg) => {
    console.log(`📥 [BRUNO] recebeu: "${msg}"`)
})

correio.registrarCaixaPostal("Carlos", (msg) => {
    console.log(`📥 [CARLOS] recebeu: "${msg}"`)
})

// Agora que TODOS estão registrados, vamos mandar mensagens
console.log("\n📨 Enviando mensagens...\n")

// Ana envia para Bruno
correio.enviarPara("Bruno", "Oi Bruno! Tudo bem?")

// Bruno envia para Carlos
correio.enviarPara("Carlos", "Carlos, preciso da sua ajuda!")

// Carlos envia para Ana
correio.enviarPara("Ana", "Ana, recebi sua solicitação!")

console.log("\n============= FIM DO EXEMPLO ==================\n")

console.log(`
🎓 EXPLICAÇÃO SIMPLES:

1. Correio = Chrome Runtime
2. registrarCaixaPostal(nome, funcao) = addListener
   → Quando alguém registra, está dizendo: "Quando chegarem mensagens pra mim, execute essa função"
3. enviarPara(destinatario, mensagem) = sendMessage
4. ORDEM IMPORTANTE:
   a) Criar o sistema (Correio)
   b) Registrar os ouvintes
   c) Só depois enviar mensagens
`)
