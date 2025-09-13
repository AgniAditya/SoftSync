import { Client } from "@modelcontextprotocol/sdk/client";
import { eventBus } from "../eventbus.ts";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class McpPresenter {
    private blenderClient : Client | null = null
    private isConnected : boolean = false

    async connectToBlender(blenderPath: string): Promise<boolean>{
        try {
            const transport = new StdioClientTransport({
                command: "python",
                args: ["-m",'blender_mcp_server', '--blender-path', blenderPath],
                env: { BLENDER_PATH: blenderPath }
            })

            this.blenderClient = new Client(
                {name : 'SoftSync' , version: '1.0.0'},
                {capabilities : { tools: {} , resources: {} , prompts: {} }}
            )

            await this.blenderClient.connect(transport)
            this.isConnected = true

            eventBus.sendToRenderer('mcp:blender-connected',true)
            return true;
        } catch (error) {
            console.log('Failed to connect to Blender MCP:', error)
            eventBus.sendToRenderer('mcp:blender-connected',false, error)
            return false
        }
    }

    async getBlenderTools(): Promise<any[]>{
        if(!this.blenderClient || !this.isConnected) return [];

        try {
            const tools = await this.blenderClient.listTools()
            return tools.tools || []
        } catch (error) {
            console.log('Failed to get Blender tools:', error)
            return []
        }
    }

    async executeBlenderTool(toolName: string, args: any): Promise<any>{
        if(!this.blenderClient || !this.isConnected){
            throw new Error('Blender MCP not connected')
        }

        try {
            const result = await this.blenderClient.callTool({
                name: toolName,
                arguments: args
            })
            return result
        } catch (error) {
            console.error(`Failed to execute Blender tool ${toolName}:`, error)
            throw error
        }
    }

    disconnect(): void{
        if(this.blenderClient){
            this.blenderClient.close()
            this.blenderClient = null
            this.isConnected = false
            eventBus.sendToRenderer('mcp:blender-disconnected')
        }
    }
}