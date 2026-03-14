import ai from "./gemini.js";
import MCPClient from "./mcpClient.js";
import { scheduleMeetingFunctionDeclaration } from "./mcpServer/serverTools.js";

const generateResponse = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt
    })
    return response.text;
}

const sendInstructionToMCPClient = async (instructions) => {
    const mcp = new MCPClient(instructions);
    await mcp.addJobs();
    await mcp.doJobs();
}

const generateTasks = async (task) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: task,
        config: {
            tools: [{
                functionDeclarations: [scheduleMeetingFunctionDeclaration]
            }]
        }
    })
    await sendInstructionToMCPClient([response.functionCalls[0]]);
    return response.functionCalls[0];
}

export {
    generateResponse,
    generateTasks
} 