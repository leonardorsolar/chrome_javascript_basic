Aqui vai **o exemplo mais simples possível** de um **listener de clique**, funcionando em HTML + JavaScript.

---

# ✅ **Exemplo super simples – Listener de Clique**

### **📄 HTML**

Crie um arquivo `index.html` com isso:

```html
<!DOCTYPE html>
<html>
    <body>
        <button id="meuBotao">Clique aqui</button>

        <script>
            // Pegamos o botão
            const botao = document.getElementById("meuBotao")

            // Registramos o Listener de clique
            botao.addEventListener("click", () => {
                alert("Você clicou no botão!")
            })
        </script>
    </body>
</html>
```

---

# 🎯 **O que acontece aqui?**

1. `getElementById` → pega o botão
2. `addEventListener("click", ...)` → registra um listener
3. A função **só roda** quando o botão é clicado

---

# 🎧 Explicação como se fosse para uma criança:

-   O botão é um **sino**
-   O `addEventListener("click")` é o **porteiro ouvindo o sino**
-   Quando você clica, o sino toca → o porteiro (listener) age → mostra o _alert_

---

Se quiser, faço uma versão **com cor**, **com contador de cliques**, ou **com mais botões falando entre si**.
