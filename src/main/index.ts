import path from 'path';
import { app , BrowserWindow } from "electron"

class App{
    private mainWindow: BrowserWindow | null = null

    constructor(){

    }

    async createWindow(){
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: path.join(__dirname,'../preload/index.ts')
            }
        })

        await this.mainWindow.loadFile('src/renderer/index.html')
    }
}

app.whenReady().then(() => {
    const newApp = new App()
    newApp.createWindow()
})