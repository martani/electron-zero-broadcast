import electron from 'electron'
import EventEmitter from 'events'

class MainBroadcastObject extends EventEmitter {
    constructor() {
        super()

        // Initialize remote module
        require('@electron/remote/main').initialize();

        electron.ipcMain.on('zero:broadcast:main', (event, {channel, args}) => {
            this.emit(channel, ...args)
        }).on('zero:broadcast:subscribe', (event, type, id) => {
            let win = electron.BrowserWindow.fromId(id)
            if(!win.__ezb) win.__ezb = {}
            win.__ezb[type] = true
        }).on('zero:broadcast:unscribe', (event, type, id) => {
            let win = electron.BrowserWindow.fromId(id)
            if(win.__ezb)
                delete win.__ezb[type]
        })
    }

    emit(channel, ...args) {
        super.emit(channel, ...args)
        electron.BrowserWindow.getAllWindows().forEach(win => {
            if(win.__ezb && win.__ezb[channel]) {
                const invoke = () => win.webContents.send('zero:broadcast:renderer', {channel, args})
                if(win.webContents.isLoading()) {
                    win.webContents.once('did-finish-load', invoke)
                } else {
                    invoke()
                }
            }
        })
    }
}

class RendererBroadcastObject extends EventEmitter {
    constructor() {
        super()
        this._windowId = require('@electron/remote').getCurrentWindow().id
        electron.ipcRenderer.on('zero:broadcast:renderer', (event, {channel, args}) => {
            super.emit(channel, ...args)
        })
        this.on('newListener', event => {
            electron.ipcRenderer.send('zero:broadcast:subscribe', event, this._windowId)
        })
        this.on('removeListener', event => {
            if(this.listenerCount(event) === 0)
                electron.ipcRenderer.send('zero:broadcast:unsubscribe', event, this._windowId)
        })
    }

    emit(channel, ...args) {
        if(channel === 'newListener' || channel === 'removeListener') {
          super.emit(channel, ...args)
        } else {
          electron.ipcRenderer.send('zero:broadcast:main', {channel, args})
        }
    }
}

if(process && process.type === 'renderer') {
    // Does not work with Angular!
    // electron.remote.require(__filename)
    module.exports = new RendererBroadcastObject()
} else {
    module.exports = new MainBroadcastObject()
}
