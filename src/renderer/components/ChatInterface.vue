<template>
  <div class="chat-interface">
    <div class="chat-header">
      <h3>{{ providerName }} Chat</h3>
      <div class="model-info">
        <span v-if="modelName" class="current-model">{{ modelName }}</span>
        <span v-else class="no-model">No model selected</span>
      </div>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <h4>Welcome to SoftSync!</h4>
        <p>Start a conversation by typing a message below. You can ask me to help with Blender operations or general questions.</p>
        <div class="example-prompts">
          <h5>Example prompts:</h5>
          <ul>
            <li>"Create a cube in Blender"</li>
            <li>"How do I add materials to objects?"</li>
            <li>"Explain the difference between Edit and Object mode"</li>
          </ul>
        </div>
      </div>

      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message"
        :class="message.role"
      >
        <div class="message-header">
          <span class="role">{{ message.role === 'user' ? 'You' : 'Assistant' }}</span>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
      </div>

      <div v-if="loading" class="loading-message">
        <div class="loading-indicator">
          <div class="spinner"></div>
          <span>Thinking...</span>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <textarea
          v-model="inputMessage"
          @keydown="handleKeyDown"
          placeholder="Type your message here..."
          class="message-input"
          rows="3"
          :disabled="loading"
        ></textarea>
        <button 
          @click="sendMessage"
          :disabled="!inputMessage.trim() || loading"
          class="send-button"
        >
          <span v-if="loading">Sending...</span>
          <span v-else>Send</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const props = defineProps<{
  messages: Message[]
  loading: boolean
  providerName: string
  modelName?: string
}>()

const emit = defineEmits<{
  'send-message': [message: string]
}>()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const sendMessage = () => {
  if (!inputMessage.value.trim() || props.loading) return
  
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  
  emit('send-message', message)
  
  // Scroll to bottom after sending
  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Auto-scroll when new messages arrive
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-interface {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  color: #495057;
}

.model-info {
  font-size: 0.9rem;
}

.current-model {
  color: #007bff;
  font-weight: bold;
}

.no-model {
  color: #6c757d;
  font-style: italic;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #ffffff;
}

.welcome-message {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}

.welcome-message h4 {
  color: #495057;
  margin-bottom: 1rem;
}

.example-prompts {
  margin-top: 1.5rem;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.example-prompts h5 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.example-prompts ul {
  list-style: none;
  padding: 0;
}

.example-prompts li {
  padding: 0.25rem 0;
  color: #007bff;
  font-style: italic;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background: #007bff;
  color: white;
  margin-left: auto;
}

.message.assistant {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.message-content {
  line-height: 1.5;
  white-space: pre-wrap;
}

.loading-message {
  padding: 1rem;
  text-align: center;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6c757d;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.input-container {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.message-input:disabled {
  background-color: #e9ecef;
  opacity: 0.6;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #0056b3;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>
