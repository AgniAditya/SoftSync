import path from 'path';
import { fileURLToPath } from 'url';
import { ipcMain } from 'electron'
import { app , BrowserWindow } from "electron"
import { McpPresenter } from './presenters/McpPresenter.ts';
import { LLMProviderPresenter } from './presenters/LLMproviderPresenter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class App{
    private mainWindow: BrowserWindow | null = null
    mcpPresenter: McpPresenter
    llmPresenter: LLMProviderPresenter

    constructor(){
        this.mcpPresenter = new McpPresenter()
        this.llmPresenter = new LLMProviderPresenter()
    }

    async createWindow(){
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: path.join(__dirname,'../preload/index.js')
            }
        })

        await this.mainWindow.loadFile(path.join(__dirname, '../../src/renderer/index.html'))
    }
}

app.whenReady().then(() => {
    const newApp = new App()
    newApp.createWindow()

    ipcMain.handle('llm:get-models', () => {
      return newApp.llmPresenter.getModels()
    })
    ipcMain.handle('llm:set-api-key', (_, apiKey: string) => {
      newApp.llmPresenter.setApiKey(apiKey)
    })
    
    ipcMain.handle('llm:set-model', (_, modelId: string) => {
      newApp.llmPresenter.setCurrentModel(modelId)
    })
    
    ipcMain.handle('llm:test-connection', async () => {
      return await newApp.llmPresenter.testConnection()
    })
    
    ipcMain.handle('llm:refresh-models', async () => {
      return await newApp.llmPresenter.fetchAvailableModels()
    })

    // MCP Blender handlers
    ipcMain.handle('mcp:connect-blender', async (_, blenderPath: string) => {
      return await newApp.mcpPresenter.connectToBlender(blenderPath)
    })

    ipcMain.handle('mcp:disconnect-blender', () => {
      newApp.mcpPresenter.disconnect()
    })

    ipcMain.handle('mcp:get-tools', async () => {
      return await newApp.mcpPresenter.getBlenderTools()
    })

    ipcMain.handle('mcp:execute-tool', async (_, toolName: string, args: any) => {
      return await newApp.mcpPresenter.executeBlenderTool(toolName, args)
    })

    // Thread/chat handlers
    ipcMain.handle('thread:send-message', async (_, message: string) => {
      try {
        // Create messages array with conversation history
        const messages = [
          { role: 'user', content: message }
        ]
        
        // Send to LLM provider
        const response = await newApp.llmPresenter.sendMessage(messages)
        return response
      } catch (error) {
        console.error('Failed to send message:', error)
        throw error
      }
    })
})