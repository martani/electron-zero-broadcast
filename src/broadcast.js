import electron from 'electron'
import EventEmitter from 'events'

class MainBroadcastObject extends EventEmitter {
    constructor() {
        super()
        electron.ipcMain.on('zero:broadcast:main', (event, {channel, args}) => {
            this.emit.apply(this, [channel, ...args])
        })
    }

    emit(channel, ...args) {
        EventEmitter.prototype.emit.apply(this, [channel, ...args])
        electron.BrowserWindow.getAllWindows().forEach(win => {
            const invoke = () => win.webContents.send('zero:broadcast:renderer', {channel, args})
            if(win.webContents.isLoading()) {
                win.webContents.once('did-finish-load', invoke)
            } else {
                invoke()
            }
        })
    }
}

class RendererBroadcastObject extends EventEmitter {
    constructor() {
        super()
        electron.ipcRenderer.on('zero:broadcast:renderer', (event, {channel, args}) => {
            EventEmitter.prototype.emit.apply(this, [channel, ...args])
        })
    }

    emit(channel, ...args) {
        electron.ipcRenderer.send('zero:broadcast:main', {channel, args})
    }
}

if(process && process.type === 'renderer') {
    electron.remote.require(__filename)
    module.exports = new RendererBroadcastObject()
} else {
    module.exports = new MainBroadcastObject()
}