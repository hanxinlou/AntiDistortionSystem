'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
var nodeConsole = require('console')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
const electron = require('electron')
let mainWindow
const Menu = electron.Menu
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  // Open dev tools initially when in development mode
  // if (process.env.NODE_ENV === "development") {
  //   mainWindow.webContents.on("did-frame-finish-load", () => {
  //     mainWindow.webContents.once("devtools-opened", () => {
  //       mainWindow.focus()
  //     })
  //     mainWindow.webContents.openDevTools()
  //   })
  // }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

var myConsole = new nodeConsole.Console(process.stdout, process.stderr)
myConsole.log('asdsadasd')
ipcMain.on('on-upload-video', (e, f) => {
  console.log(f)
})
