import EventEmitter from 'events'

export class EventBus extends EventEmitter{
    sendToMain(eventName: string , ...args: unknown[]){
        this.emit(eventName, ...args)
    }

    sendToRenderer(eventName: string, ...args: unknown[]){
        if(this.mainWindow){
            this.mainWindow.webContents.send(eventName,...args)
        }
    }
}

export const eventBus = new EventBus()