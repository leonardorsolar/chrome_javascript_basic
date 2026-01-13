# 📨 Simulação - Arquitetura Chrome Extension

Simulação modular da arquitetura de uma Chrome Extension (Meet Track) mostrando o sistema de mensagens entre os 3 contextos isolados.

## 📁 Estrutura dos Arquivos

```
├── index.js              # Arquivo principal - executa a simulação
├── chrome-runtime.js     # Simula chrome.runtime API
├── content-script.js     # Content Script (injetado na página)
├── background.js         # Background Script (Service Worker)
└── popup.js              # Popup/Side Panel (Vue App)
```

## 🚀 Como Executar

```bash
node index.js
```

## 📦 Módulos

### 1. chrome-runtime.js
Simula a API `chrome.runtime` do navegador:
- `sendMessage()` - Envia mensagem entre contextos
- `addListener()` - Registra listeners
- `broadcast()` - Envia para todos os contextos

### 2. content-script.js
**Content Script** - Injetado na página web:
- Captura eventos do usuário (seleção de texto, cliques)
- Envia mensagens para background
- **NÃO** pode fazer chamadas à API (CORS)

### 3. background.js
**Background Script** - Service Worker (Manifest V3):
- Recebe todas as mensagens
- Gerencia autenticação (tokens JWT)
- Faz chamadas à API externa
- Faz broadcast para outros contextos

### 4. popup.js
**Popup/Side Panel** - Interface Vue:
- Exibe UI da extensão
- Gerencia estado local (textos, mensagens)
- Envia comandos para background
- Recebe broadcasts

### 5. index.js
**Orquestrador**:
- Importa todos os módulos
- Instancia os 3 contextos
- Executa cenários de teste

## 🔄 Fluxo de Mensagens

```
┌─────────────────┐
│  Content Script │  Captura evento (ex: texto selecionado)
└────────┬────────┘
         │ chrome.runtime.sendMessage()
         ↓
┌─────────────────┐
│   Background    │  Processa, adiciona token, chama API
└────────┬────────┘
         │ broadcast()
         ↓
┌─────────────────┐
│   Popup/Vue     │  Recebe e atualiza UI
└─────────────────┘
```

## 🎬 Cenários Simulados

1. **Seleção de Texto** - Content captura → Background broadcast → Popup exibe
2. **Envio de Mensagem** - Popup envia → Background chama API → Popup recebe resposta
3. **Gravação de Áudio** - Content inicia → Background gerencia → Notifica todos
4. **Salvar Reunião** - Popup envia → Background salva → Retorna ID

## 🔑 Conceitos-Chave

### Contextos Isolados
Cada módulo representa um **contexto isolado** no Chrome:
- Não compartilham memória diretamente
- Comunicam apenas via `chrome.runtime`
- Cada um tem suas restrições e capacidades

### Restrições de CORS
- **Content Script**: ❌ Não pode fazer `fetch()` para APIs
- **Background**: ✅ Pode fazer `fetch()` sem restrições
- **Popup**: ❌ Não pode fazer `fetch()` direto (usa background)

### Comunicação Assíncrona
- Todas as mensagens são **assíncronas**
- Usa callbacks ou Promises
- Background pode fazer broadcast para múltiplos contextos
