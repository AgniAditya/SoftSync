<template>
  <div class="openrouter-selector">
    <h3>OpenRouter Configuration</h3>
    
    <!-- API Key Input -->
    <div class="api-key-section">
      <label for="api-key">OpenRouter API Key:</label>
      <input 
        id="api-key"
        v-model="apiKey"
        type="password"
        placeholder="Enter your OpenRouter API key"
        @blur="updateApiKey"
        class="api-key-input"
      />
      <div class="api-key-status" :class="apiKeyStatus">
        {{ apiKeyStatusText }}
      </div>
    </div>

    <!-- Model Categories -->
    <div class="model-categories">
      <button 
        @click="activeCategory = 'all'"
        :class="{ active: activeCategory === 'all' }"
        class="category-button"
      >
        All Models
      </button>
      <button 
        @click="activeCategory = 'free'"
        :class="{ active: activeCategory === 'free' }"
        class="category-button"
      >
        Free Models
      </button>
      <button 
        @click="activeCategory = 'paid'"
        :class="{ active: activeCategory === 'paid' }"
        class="category-button"
      >
        Paid Models
      </button>
    </div>

    <!-- Model Selection -->
    <div class="model-selection">
      <label>Select Model:</label>
      <div class="model-list">
        <div 
          v-for="model in filteredModels" 
          :key="model.id"
          class="model-item"
          :class="{ active: model.id === currentModel }"
          @click="selectModel(model.id)"
        >
          <div class="model-header">
            <div class="model-name">{{ model.name }}</div>
            <div class="model-provider">{{ model.topProvider?.name || 'Unknown' }}</div>
          </div>
          <div class="model-description">{{ model.description }}</div>
          <div class="model-info">
            <span class="pricing" :class="{ free: isFreeModel(model) }">
              {{ isFreeModel(model) ? 'FREE' : `${model.pricing.prompt}/${model.pricing.completion}` }}
            </span>
            <span class="context-length">{{ formatContextLength(model.contextLength) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Test -->
    <div class="connection-test">
      <button 
        @click="testConnection"
        :disabled="!apiKey || testing"
        class="test-button"
      >
        {{ testing ? 'Testing...' : 'Test Connection' }}
      </button>
      <div v-if="connectionStatus" class="connection-status" :class="connectionStatus">
        {{ connectionStatusText }}
      </div>
    </div>

    <!-- Refresh Models -->
    <div class="refresh-models">
      <button 
        @click="refreshModels"
        :disabled="!apiKey || refreshing"
        class="refresh-button"
      >
        {{ refreshing ? 'Refreshing...' : 'Refresh Models' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  models: any[]
  currentModel: string
  apiKey: string
}>()

const emit = defineEmits<{
  'api-key-updated': [apiKey: string]
  'model-changed': [modelId: string]
}>()

const apiKey = ref(props.apiKey)
const activeCategory = ref('free') // Default to free models
const testing = ref(false)
const refreshing = ref(false)
const connectionStatus = ref<'success' | 'error' | null>(null)

const apiKeyStatus = computed(() => {
  return apiKey.value ? 'set' : 'not-set'
})

const apiKeyStatusText = computed(() => {
  return apiKey.value ? '✓ API Key Set' : '⚠ API Key Required'
})

const connectionStatusText = computed(() => {
  if (connectionStatus.value === 'success') return '✓ Connection Successful'
  if (connectionStatus.value === 'error') return '✗ Connection Failed'
  return ''
})

const filteredModels = computed(() => {
  switch (activeCategory.value) {
    case 'free':
      return props.models.filter(model => isFreeModel(model))
    case 'paid':
      return props.models.filter(model => !isFreeModel(model))
    default:
      return props.models
  }
})

const isFreeModel = (model: any) => {
  return model.pricing.prompt === 'Free' && model.pricing.completion === 'Free'
}

const formatContextLength = (length: number) => {
  if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M tokens`
  if (length >= 1000) return `${(length / 1000).toFixed(0)}K tokens`
  return `${length} tokens`
}

const updateApiKey = () => {
  emit('api-key-updated', apiKey.value)
}

const selectModel = (modelId: string) => {
  emit('model-changed', modelId)
}

const testConnection = async () => {
  if (!apiKey.value) return
  
  testing.value = true
  connectionStatus.value = null
  
  try {
    const success = await window.electron.ipcRenderer.invoke('llm:test-connection')
    connectionStatus.value = success ? 'success' : 'error'
  } catch (error) {
    connectionStatus.value = 'error'
    console.error('Connection test failed:', error)
  } finally {
    testing.value = false
  }
}

const refreshModels = async () => {
  if (!apiKey.value) return
  
  refreshing.value = true
  
  try {
    await window.electron.ipcRenderer.invoke('llm:refresh-models')
  } catch (error) {
    console.error('Failed to refresh models:', error)
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped>
.openrouter-selector {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.api-key-section {
  margin-bottom: 1.5rem;
}

.api-key-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.api-key-status.set {
  color: green;
}

.api-key-status.not-set {
  color: orange;
}

.model-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.category-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.model-selection {
  margin-bottom: 1.5rem;
}

.model-list {
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.model-item {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.model-item:hover {
  background-color: #f0f0f0;
}

.model-item.active {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.model-name {
  font-weight: bold;
}

.model-provider {
  font-size: 0.8rem;
  color: #666;
  background: #e9ecef;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.model-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.model-info {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.pricing.free {
  background: #28a745;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-weight: bold;
}

.pricing:not(.free) {
  color: #666;
}

.context-length {
  color: #666;
}

.test-button, .refresh-button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.test-button:disabled, .refresh-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.connection-status.success {
  color: green;
  margin-top: 0.5rem;
}

.connection-status.error {
  color: red;
  margin-top: 0.5rem;
}
</style>