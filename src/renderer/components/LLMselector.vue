<template>
  <div class="llm-selector">
    <h3>LLM Provider</h3>
    
    <div class="provider-list">
      <div 
        v-for="provider in providers" 
        :key="provider.id"
        class="provider-item"
        :class="{ active: provider.id === currentProvider }"
        @click="selectProvider(provider.id)"
      >
        <div class="provider-name">{{ provider.name }}</div>
        <div class="provider-models">
          {{ provider.models.join(', ') }}
        </div>
        <input 
          v-if="provider.id === currentProvider"
          v-model="apiKey"
          type="password"
          placeholder="Enter API Key"
          @blur="updateApiKey"
          class="api-key-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  providers: any[]
  currentProvider: string
}>()

const emit = defineEmits<{
  'provider-changed': [providerId: string]
  'api-key-updated': [providerId: string, apiKey: string]
}>()

const apiKey = ref('')

const selectProvider = (providerId: string) => {
  emit('provider-changed', providerId)
}

const updateApiKey = () => {
  if (apiKey.value && props.currentProvider) {
    emit('api-key-updated', props.currentProvider, apiKey.value)
  }
}

watch(() => props.currentProvider, (newProvider) => {
  apiKey.value = ''
})
</script>

<style>
.llm-selector {
  margin-bottom: 2rem;
}

.provider-item {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.provider-item.active {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.provider-name {
  font-weight: bold;
}

.provider-models {
  font-size: 0.8rem;
  color: #666;
}

.api-key-input {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 2px;
}
</style>