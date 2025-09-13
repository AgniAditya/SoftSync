import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, callback: Function) => {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel)
    }
  }
})

contextBridge.exposeInMainWorld('api', {
  getWebContentsId: () => ipcRenderer.sendSync('get-web-contents-id')
})