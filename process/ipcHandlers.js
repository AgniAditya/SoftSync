import { ipcMain } from "electron";
import {generateResponse, generateTasks } from "./services.js";

export function loadIpcHandlers() {
    ipcMain.handle('getUserResponse', async (event,prompt) => {
        return await generateResponse(prompt)
    })
    ipcMain.handle('getUserTaskResponse', async (event,prompt) => {
        return await generateTasks(prompt)
    })
}