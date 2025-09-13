<template>
  <div class="app">
    <header class="header">
      <h1>SoftSync</h1>
      <div class="status">
        <span :class="['status-indicator', mcpConnected ? 'connected' : 'disconnected']">
          Blender MCP: {{ mcpConnected ? 'Connected' : 'Disconnected' }}
        </span>
        <span class="llm-status">
          Model: {{ currentModelName || 'None Selected' }}
        </span>
      </div>
    </header>

    <main class="main">
      <div class="sidebar">
        <OpenRouterSelector 
          :models="openrouterModels"
          :current-model="currentModel"
          :api-key="apiKey"
          @api-key-updated="handleApiKeyUpdate"
          @model-changed="handleModelChange"
        />
        
        <BlenderMCP 
          :connected="mcpConnected"
          @connect="handleBlenderConnect"
          @disconnect="handleBlenderDisconnect"
        />
      </div>

      <div class="chat-area">
        <ChatInterface 
          :messages="messages"
          :loading="loading"
          :provider-name="'OpenRouter'"
          :model-name="currentModelName"
          @send-message="handleSendMessage"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import OpenRouterSelector from './components/OpenRouterSelector.vue'
import BlenderMCP from './components/BlenderMCP.vue'
import ChatInterface from './components/ChatInterface.vue'

const openrouterModels = ref([])
const currentModel = ref('meta-llama/llama-3.1-8b-instruct:free') // Default to free model
const apiKey = ref('')
const mcpConnected = ref(false)
const messages = ref([])
const loading = ref(false)

const currentModelName = computed(() => {
  const model = openrouterModels.value.find(m => m.id === currentModel.value)
  return model ? model.name : currentModel.value
})

onMounted(() => {
  // Load OpenRouter models
  loadOpenRouterModels()
  
  // Listen for events from main process
  window.electron.ipcRenderer.on('mcp:blender-connected', (_, connected, error) => {
    mcpConnected.value = connected
    if (error) {
      console.error('Blender MCP connection error:', error)
    }
  })

  window.electron.ipcRenderer.on('llm:model-changed', (_, modelId) => {
    currentModel.value = modelId
  })

  window.electron.ipcRenderer.on('llm:api-key-updated', (_, status) => {
    console.log('API Key status:', status)
  })
})

const loadOpenRouterModels = async () => {
  openrouterModels.value = await window.electron.ipcRenderer.invoke('llm:get-models')
}

const handleApiKeyUpdate = async (newApiKey: string) => {
  apiKey.value = newApiKey
  await window.electron.ipcRenderer.invoke('llm:set-api-key', newApiKey)
}

const handleModelChange = async (modelId: string) => {
  currentModel.value = modelId
  await window.electron.ipcRenderer.invoke('llm:set-model', modelId)
}

const handleBlenderConnect = async (blenderPath: string) => {
  await window.electron.ipcRenderer.invoke('mcp:connect-blender', blenderPath)
}

const handleBlenderDisconnect = async () => {
  await window.electron.ipcRenderer.invoke('mcp:disconnect-blender')
}

const handleSendMessage = async (message: string) => {
  messages.value.push({ role: 'user', content: message, timestamp: new Date() })
  loading.value = true

  try {
    const response = await window.electron.ipcRenderer.invoke('thread:send-message', message)
    messages.value.push({ role: 'assistant', content: response, timestamp: new Date() })
  } catch (error) {
    messages.value.push({ role: 'assistant', content: `Error: ${error.message}`, timestamp: new Date() })
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Same styles as before */
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator.connected {
  color: green;
}

.status-indicator.disconnected {
  color: red;
}

.main {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 400px;
  padding: 1rem;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
}

.chat-area {
  flex: 1;
  padding: 1rem;
}
</style>