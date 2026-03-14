import ai from "./gemini.js";
import MCPClient from "./mcpClient.js";

const generateResponse = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    })
    const arr = response.text.split(" ");
    sendInstructionToMCPClient(arr)
    return response.text;
}

const sendInstructionToMCPClient = async (instructions) => {
    const mcp = new MCPClient(instructions);
    mcp.addJobs();
    mcp.doJobs();
}

export default generateResponse