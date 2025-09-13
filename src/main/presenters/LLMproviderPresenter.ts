import axios from "axios";
import { eventBus } from "../eventbus.ts";

interface OpenRouterModel{
    id: string
    name: string
    description: string
    contextLength: number
    pricing: {
        prompt: string
        completion: string
    }
    topProvider? : {
        id: string
        name: string
    }
}

interface OpenRouterProvider{
    id: 'openrouter'
    name: 'OpenRouter'
    apiKey: string
    baseUrl: string
    models: OpenRouterModel[]
}

export class LLMProviderPresenter{
    private provider: OpenRouterProvider
    private currentModel : string = "deepseek/deepseek-chat"

    constructor(){
        this.provider = {
        id: 'openrouter',
        name: 'OpenRouter',
        apiKey: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        models: 
            [{
                id: 'deepseek/deepseek-chat',
                name: 'DeepSeek Chat',
                description: 'General purpose conversational model',
                contextLength: 32768,
                pricing: { prompt: '$0.14', completion: '$0.28' },
                topProvider: { id: 'deepseek', name: 'DeepSeek' }
            },
            {
                id: 'deepseek/deepseek-coder',
                name: 'DeepSeek Coder',
                description: 'Specialized for coding tasks',
                contextLength: 16384,
                pricing: { prompt: '$0.14', completion: '$0.28' },
                topProvider: { id: 'deepseek', name: 'DeepSeek' }
            },
            {
                id: 'meta-llama/llama-3.1-8b-instruct:free',
                name: 'Llama 3.1 8B (Free)',
                description: 'Free Llama model for general use',
                contextLength: 131072,
                pricing: { prompt: 'Free', completion: 'Free' },
                topProvider: { id: 'meta', name: 'Meta' }
            },
            {
                id: 'google/gemini-flash-1.5:free',
                name: 'Gemini Flash 1.5 (Free)',
                description: 'Google\'s free Gemini model',
                contextLength: 1048576,
                pricing: { prompt: 'Free', completion: 'Free' },
                topProvider: { id: 'google', name: 'Google' }
            },
            {
                id: 'anthropic/claude-3-haiku',
                name: 'Claude 3 Haiku',
                description: 'Fast and efficient Claude model',
                contextLength: 200000,
                pricing: { prompt: '$0.25', completion: '$1.25' },
                topProvider: { id: 'anthropic', name: 'Anthropic' }
            }]
        }
    }

    getProvider(): OpenRouterProvider {
        return this.provider
    }

    getModels(): OpenRouterModel[] {
        return this.provider.models
    }

    getFreeModels(): OpenRouterModel[]{
        return this.provider.models.filter(model => 
            model.pricing.prompt === 'Free' && model.pricing.completion === 'Free'
        )
    }

    getPaidModels(): OpenRouterModel[]{
        return this.provider.models.filter(model => 
            model.pricing.prompt !== 'Free' && model.pricing.completion !== 'Free'
        )
    }

    setApiKey(apiKey: string): void{
        this.provider.apiKey = apiKey
        eventBus.sendToRenderer('llm:api-key-updated', apiKey ? 'Set' : 'Not Set')
    }

    setCurrentModel(modelId: string): void {
    if (this.provider.models.some(m => m.id === modelId)) {
            this.currentModel = modelId
            eventBus.sendToRenderer('llm:model-changed', modelId)
        }
    }

    getCurrentModel(): string {
        return this.currentModel
    }

    async sendMessage(messages: any[] , model?: string): Promise<string> {
        if(!this.provider.apiKey){
            throw new Error('OpenRouter API key is required. Please set your API key in settings.')
        }

        const selectedModel = model || this.currentModel

        try {
            const response = await axios.post(
                `${this.provider.baseUrl}/chat/completions`,
                {
                    model: selectedModel,
                    messages: messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                    stream: false 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.provider.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'softsync.local',
                        'X-Title': 'SoftSync'
                    },
                    timeout: 3000
                }
            )

            return response.data.choices[0].message.content
        } catch (error) {
            console.error('OpenRouter API call failed:', error)
      
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                throw new Error('Invalid OpenRouter API key. Please check your API key.')
                } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.')
                } else if (error.response?.status === 400) {
                throw new Error('Invalid request. Please check your input.')
                } else if (error.response?.status === 402) {
                throw new Error('Insufficient credits. Please add credits to your OpenRouter account.')
                }
            }
            
            throw new Error(`OpenRouter API error: ${error}`)
        }
    }

    async testConnection(): Promise<boolean> {
        if (!this.provider.apiKey) {
            return false
        }

        try {
            const response = await axios.post(
                `${this.provider.baseUrl}/chat/completions`,
                {
                    model: 'meta-llama/llama-3.1-8b-instruct:free',
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 10
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.provider.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'softsync.local',
                        'X-Title': 'SoftSync'
                    },
                    timeout: 10000
                }
            )

            return response.status === 200
        } catch (error) {
            console.error('OpenRouter connection test failed:', error)
            return false
        }
    }

    async fetchAvailableModels(): Promise<OpenRouterModel[]> {
        if (!this.provider.apiKey) {
            return this.provider.models
        }

        try {
            const response = await axios.get(
                `${this.provider.baseUrl}/models`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.provider.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            const openRouterModels = response.data.data.map((model: any) => ({
                id: model.id,
                name: model.name,
                description: model.description || 'No description available',
                contextLength: model.context_length || 4096,
                pricing: {
                prompt: model.pricing?.prompt || 'Unknown',
                completion: model.pricing?.completion || 'Unknown'
                },
                topProvider: model.top_provider
            }))

            this.provider.models = openRouterModels
            return openRouterModels
        } catch (error) {
            console.error('Failed to fetch OpenRouter models:', error)
            return this.provider.models
        }
    }
}