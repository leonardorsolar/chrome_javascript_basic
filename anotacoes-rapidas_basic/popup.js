// Elementos da página
const notepad = document.getElementById("notepad")
const saveStatus = document.getElementById("saveStatus")
const clearBtn = document.getElementById("clearBtn")

// Carregar notas salvas quando abrir
chrome.storage.sync.get(["notes"], function (result) {
    if (result.notes) {
        notepad.value = result.notes
    }
})

// Salvar automaticamente enquanto digita
notepad.addEventListener("input", function () {
    const texto = notepad.value

    // Salvar no Chrome Storage
    chrome.storage.sync.set({ notes: texto }, function () {
        // Mostrar feedback de salvamento
        saveStatus.textContent = "✅ Salvo!"
        saveStatus.style.color = "#4ade80"

        // Voltar ao texto normal depois de 2 segundos
        setTimeout(function () {
            saveStatus.textContent = "💾 Salvo automaticamente"
            saveStatus.style.color = "white"
        }, 2000)
    })
})

// Botão para limpar tudo
clearBtn.addEventListener("click", function () {
    // Confirmar antes de limpar
    const confirmacao = confirm(
        "Tem certeza que deseja limpar todas as anotações?"
    )

    if (confirmacao) {
        notepad.value = ""
        chrome.storage.sync.remove(["notes"])

        saveStatus.textContent = "🗑️ Anotações limpas!"
        saveStatus.style.color = "#fb923c"

        setTimeout(function () {
            saveStatus.textContent = "💾 Salvo automaticamente"
            saveStatus.style.color = "white"
        }, 2000)
    }
})
