<template>
  <div class="blender-mcp">
    <h3>Blender MCP Connection</h3>
    
    <div class="connection-status" :class="{ connected: connected, disconnected: !connected }">
      <span class="status-indicator"></span>
      {{ connected ? 'Connected to Blender' : 'Not Connected' }}
    </div>

    <div v-if="!connected" class="connection-form">
      <label for="blender-path">Blender Executable Path:</label>
      <input 
        id="blender-path"
        v-model="blenderPath"
        type="text"
        placeholder="C:\Program Files\Blender Foundation\Blender 4.0\blender.exe"
        class="path-input"
      />
      <button 
        @click="connectToBlender"
        :disabled="!blenderPath || connecting"
        class="connect-button"
      >
        {{ connecting ? 'Connecting...' : 'Connect to Blender' }}
      </button>
    </div>

    <div v-if="connected" class="disconnect-section">
      <button @click="disconnectFromBlender" class="disconnect-button">
        Disconnect from Blender
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="connected" class="tools-section">
      <h4>Available Blender Tools</h4>
      <div v-if="tools.length === 0" class="no-tools">
        No tools available. Make sure Blender MCP server is running.
      </div>
      <div v-else class="tools-list">
        <div v-for="tool in tools" :key="tool.name" class="tool-item">
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-description">{{ tool.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  connected: boolean
}>()

const emit = defineEmits<{
  'connect': [blenderPath: string]
  'disconnect': []
}>()

const blenderPath = ref('')
const connecting = ref(false)
const error = ref('')
const tools = ref([])

onMounted(() => {
  // Listen for MCP events
  window.electron.ipcRenderer.on('mcp:blender-connected', (_, connected, errorMessage) => {
    connecting.value = false
    if (errorMessage) {
      error.value = errorMessage
    } else {
      error.value = ''
    }
  })

  window.electron.ipcRenderer.on('mcp:blender-disconnected', () => {
    connecting.value = false
    error.value = ''
    tools.value = []
  })

  window.electron.ipcRenderer.on('mcp:tools-updated', (_, toolsList) => {
    tools.value = toolsList
  })
})

const connectToBlender = async () => {
  if (!blenderPath.value) return
  
  connecting.value = true
  error.value = ''
  
  try {
    emit('connect', blenderPath.value)
  } catch (err) {
    connecting.value = false
    error.value = 'Failed to connect to Blender'
  }
}

const disconnectFromBlender = () => {
  emit('disconnect')
}
</script>

<style scoped>
.blender-mcp {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  margin-bottom: 1rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.connection-status.connected .status-indicator {
  background-color: #28a745;
}

.connection-status.disconnected .status-indicator {
  background-color: #dc3545;
}

.connection-form {
  margin-bottom: 1rem;
}

.path-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.connect-button, .disconnect-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.connect-button {
  background: #007bff;
  color: white;
}

.connect-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.disconnect-button {
  background: #dc3545;
  color: white;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.tools-section {
  margin-top: 1rem;
}

.tools-list {
  max-height: 200px;
  overflow-y: auto;
}

.tool-item {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: white;
}

.tool-name {
  font-weight: bold;
  color: #007bff;
}

.tool-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.no-tools {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}
</style>
