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

var myConsole = new nodeConsole.Console(process.stdout, process.stderr)
// myConsole.log('asdsadasd')
ipcMain.on('on-upload-video', (e, f) => {
  myConsole.log(f)
})
ipcMain.on('transImgData', (e, f) => {
  myConsole.log(f)
  f.filePath = f.filePath.replace(/\\/g, '/')
  // f.filePath = '"' + f.filePath + '"'
  myConsole.log(f.filePath)
  let str = f.filePath.split('/')
  let returnPath = process.cwd() + '/temp/' + str[str.length - 1].replace(/"/g, '')
  myConsole.log(returnPath)
  execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'simple', '--img', f.filePath, '--output', process.cwd() + '/temp', '--cx', f.CX, '--cy', f.CY, '--k1', f.K1, '--k2', f.K2], (err, stdout, stderr) => {
    if (err) {
      myConsole.log(err)
      myConsole.log(`stdout: ${stdout}`)
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
ipcMain.on('transSampleData', (e, f) => {
  myConsole.log(f)
  f.filePath = f.filePath.replace(/\\/g, '/')
  // f.filePath = '"' + f.filePath + '"'
  myConsole.log(f.filePath)
  let returnAePath = process.cwd() + '/temp/'
  myConsole.log(returnAePath)
  let g
  if (f.preData.isGenetic === true) {
    g = f.preData.genGenerate + 1
    g = g.toString()
    myConsole.log(g)
    returnAePath = returnAePath + g + '.png'
    if (f.preData.isAnnealing === true) {
      execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--video', f.filePath, '--video_progress', f.sampleTimePoint, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--ga_m', f.preData.genProM, '--ga_c', f.preData.genProC, '--pop', f.preData.genPopulation, '--gen', f.preData.genGenerate, '--use_saa', '--saa_begin_t', f.preData.startTemperature, '--saa_end_t', f.preData.endTemperature, '--saa_delta', f.preData.coolingRate], (err, stdout, stderr) => {
        if (err) {
          myConsole.log(err)
          myConsole.log(`stdout: ${stdout}`)
          return
        }
        myConsole.log(`stdout: ${stdout}`)
      })
    } else {
      execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--video', f.filePath, '--video_progress', f.sampleTimePoint, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--ga_m', f.preData.genProM, '--ga_c', f.preData.genProC, '--pop', f.preData.genPopulation, '--gen', f.preData.genGenerate], (err, stdout, stderr) => {
        if (err) {
          myConsole.log(err)
          return
        }
        myConsole.log(`stdout: ${stdout}`)
      })
    }
  } else {
    g = f.preData.evoGenerate + 1
    g = g.toString()
    returnAePath = returnAePath + g + '.png'
    execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--video', f.filePath, '--video_progress', f.sampleTimePoint, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--use_es', '--pop', f.preData.evoPopulation, '--gen', f.preData.evoGenerate], (err, stdout, stderr) => {
      if (err) {
        myConsole.log(err)
        return
      }
      myConsole.log(`stdout: ${stdout}`)
    })
  }
  myConsole.log(returnAePath)
  fs.readFile(process.cwd() + '/temp/video_raw.png', (err, data) => {
    if (err) {
      myConsole.log(err)
    }
    mainWindow.webContents.send('returnSrcPath', data)
  })
  fs.readFile(returnAePath, (err, data) => {
    if (err) {
      myConsole.log(err)
    }
    mainWindow.webContents.send('returnAePath', data)
  })
})
ipcMain.on('transVideoData', (e, f) => {
  myConsole.log(f)
  // f.filepath = f.filepath.replace(/\\/g, '/')
  // myConsole.log(f.filepath)
  // let str = f.filepath.split('/')
  // myConsole.log(str)
  // let returnPath = process.cwd() + '/temp/' + str[str.length - 1]
  // console.log(returnPath)
  // execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'simple', '--img', f.filepath, '--output', process.cwd() + '/temp', '--cx', f.CX, '--cy', f.CY, '--k1', f.K1, '--k2', f.K2], (err, stdout, stderr) => {
  //   if (err) {
  //     myConsole.log(err)
  //     return
  //   }
  //   myConsole.log(`stdout: ${stdout}`)
  //   fs.readFile(returnPath, (err, data) => {
  //     if (err) {
  //       myConsole.log(err)
  //     }
  //     mainWindow.webContents.send('returnVideo', data)
  //   })
  // })
  mainWindow.webContents.send('returnVideo', 'returnVideoData')
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
