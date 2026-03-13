import { ipcMain } from "electron";
import generateResponse from "./services.js";

export function loadIpcHandlers() {
    ipcMain.handle('getUserResponse', async (event,prompt) => {
        return await generateResponse(prompt)
    })
}