'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
const { execFile } = require('child_process')
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
    height: 725,
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
// myConsole.log('asdsadasd')
ipcMain.on('on-upload-video', (e, f) => {
  myConsole.log(f)
})
// ipcMain.on('on-upload-img', (e, f) => {
//   myConsole.log(f)
// })
ipcMain.on('transVideoData', (e, f) => {
  myConsole.log(f)
  // execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'simple', '--img', 'd:/penglai.jpg', '--ouput', './temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2], (err, stdout, stderr) => {
  //   if (err) {
  //     myConsole.log(err)
  //     return
  //   }
  //   myConsole.log(`stdout: ${stdout}`)
  // })
})
ipcMain.on('transImgData', (e, f) => {
  myConsole.log(f)
  f.filepath = f.filepath.replace(/\\/g, '/')
  myConsole.log(f.filepath)
  let str = f.filepath.split('/')
  myConsole.log(str)
  let returnPath = process.cwd() + '/temp/' + str[str.length - 1]
  execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'simple', '--img', f.filepath, '--output', process.cwd() + '/temp', '--cx', f.CX, '--cy', f.CY, '--k1', f.K1, '--k2', f.K2], (err, stdout, stderr) => {
    if (err) {
      myConsole.log(err)
      return
    }
    myConsole.log(`stdout: ${stdout}`)
    fs.readFile(returnPath, (err, data) => {
      if (err) {
        myConsole.log(err)
      }
      mainWindow.webContents.send('returnImg', data)
    })
  })
})

// 检测文件或者文件夹存在 nodeJS
function fsExistsSync (path) {
  try {
    fs.accessSync(path, fs.F_OK)
  } catch (e) {
    return false
  }
  return true
}

if (!fsExistsSync('temp')) {
  fs.mkdir('temp')
}
