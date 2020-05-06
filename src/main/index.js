'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
const { execFile } = require('child_process')
var nodeConsole = require('console')

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
  // 创建窗口
  mainWindow = new BrowserWindow({
    height: 725,
    useContentSize: true,
    width: 1000,
    title: 'VR视频反畸变校正演示系统'
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

let t

// 监听上传 如果有上传则清空输出文件夹
ipcMain.on('on-upload-video', (e, f) => {
  execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--cli', 'abort'], (err, stdout, stderr) => {
    if (err) {
      myConsole.log(err)
      myConsole.log(`stdout: ${stdout}`)
      return
    }
    myConsole.log(`stdout: ${stdout}`)
    myConsole.log('stop')
  })
  clearInterval(t)
})

// 监听图像畸变处理 调用畸变算法 返回畸变图像
ipcMain.on('transImgData', (e, f) => {
  f.filePath = f.filePath.replace(/\\/g, '/')
  let str = f.filePath.split('/')
  let returnPath = process.cwd() + '/tempimg/' + str[str.length - 1]
  execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'simple', '--img', f.filePath, '--output', process.cwd() + '/tempimg', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2], (err, stdout, stderr) => {
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
      mainWindow.webContents.send('returnAeImg', data)
    })
  })
})

// 监听图像矫正 调用矫正算法 返回矫正图像
ipcMain.on('transAeData', (e, f) => {
  let files = fs.readdirSync(process.cwd() + '/temp')
  files.forEach(function (file) {
    fs.unlinkSync(process.cwd() + '/temp/' + file)
  })
  f.filePath = f.filePath.replace(/\\/g, '/')
  myConsole.log(f.filePath)
  let returns = process.cwd() + '/temp/'
  let i = 1
  let g
  let returnCorrectPath = returns + i.toString() + '.png'
  if (f.preData.isGenetic === true) {
    g = f.preData.genGenerate
    if (f.preData.isAnnealing === true) {
      execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--img', f.filePath, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--ga_m', f.preData.genProM, '--ga_c', f.preData.genProC, '--pop', f.preData.genPopulation, '--gen', f.preData.genGenerate, '--use_saa', '--saa_begin_t', f.preData.startTemperature, '--saa_end_t', f.preData.endTemperature, '--saa_delta', f.preData.coolingRate], (err, stdout, stderr) => {
        if (err) {
          myConsole.log(err)
          myConsole.log(`stdout: ${stdout}`)
          return
        }
        myConsole.log(`stdout: ${stdout}`)
      })
    } else {
      execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--img', f.filePath, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--ga_m', f.preData.genProM, '--ga_c', f.preData.genProC, '--pop', f.preData.genPopulation, '--gen', f.preData.genGenerate], (err, stdout, stderr) => {
        if (err) {
          myConsole.log(err)
          return
        }
        myConsole.log(`stdout: ${stdout}`)
      })
    }
  } else {
    myConsole.log('evo')
    g = f.preData.evoGenerate
    execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--img', f.filePath, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--use_es', '--pop', f.preData.evoPopulation, '--gen', f.preData.evoGenerate], (err, stdout, stderr) => {
      if (err) {
        myConsole.log(err)
        return
      }
      myConsole.log(`stdout: ${stdout}`)
    })
  }
  t = setInterval(() => {
    fs.readFile(returnCorrectPath, (err, data) => {
      if (err) {
        myConsole.log(err)
        return
      }
      mainWindow.webContents.send('returnCorrectImg', data)
      i++
      returnCorrectPath = returns + i.toString() + '.png'
      if (i === (g + 2)) {
        myConsole.log('i===g+2')
        clearInterval(t)
      }
    })
  }, 1000)
})

// 监听视频采样 调用图像矫正算法 返回矫正图像
ipcMain.on('transSampleData', (e, f) => {
  let files = fs.readdirSync(process.cwd() + '/temp')
  files.forEach(function (file) {
    fs.unlinkSync(process.cwd() + '/temp/' + file)
  })
  f.filePath = f.filePath.replace(/\\/g, '/')
  let returns = process.cwd() + '/temp/'
  let i = 1
  let g
  let returnAePath = returns + i.toString() + '.png'
  if (f.preData.isGenetic === true) {
    g = f.preData.genGenerate
    if (f.preData.isAnnealing === true) {
      execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--video', f.filePath, '--video_progress', f.sampleTimePoint, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--ga_m', f.preData.genProM, '--ga_c', f.preData.genProC, '--pop', f.preData.genPopulation, '--gen', f.preData.genGenerate, '--use_saa', '--saa_begin_t', f.preData.startTemperature, '--saa_end_t', f.preData.endTemperature, '--saa_delta', f.preData.coolingRate, '--convert_video', '--cmp_video'], (err, stdout, stderr) => {
        if (err) {
          myConsole.log(err)
          myConsole.log(`stdout: ${stdout}`)
          return
        }
        myConsole.log(`stdout: ${stdout}`)
      })
    } else {
      execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--video', f.filePath, '--video_progress', f.sampleTimePoint, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--ga_m', f.preData.genProM, '--ga_c', f.preData.genProC, '--pop', f.preData.genPopulation, '--gen', f.preData.genGenerate, '--convert_video', '--cmp_video'], (err, stdout, stderr) => {
        if (err) {
          myConsole.log(err)
          return
        }
        myConsole.log(`stdout: ${stdout}`)
      })
    }
  } else {
    g = f.preData.evoGenerate
    execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--mode', 'correct', '--video', f.filePath, '--video_progress', f.sampleTimePoint, '--output', process.cwd() + '/temp', '--cx', f.preData.valueX, '--cy', f.preData.valueY, '--k1', f.preData.parameter1, '--k2', f.preData.parameter2, '--use_es', '--pop', f.preData.evoPopulation, '--safasfas', '--gen', f.preData.evoGenerate, '--convert_video', '--cmp_video'], (err, stdout, stderr) => {
      if (err) {
        myConsole.log(err)
        return
      }
      myConsole.log(`stdout: ${stdout}`)
    })
  }
  t = setInterval(() => {
    fs.readFile(process.cwd() + '/temp/video_raw.png', (err, data) => {
      if (err) {
        myConsole.log(err)
        return
      }
      mainWindow.webContents.send('returnSrcPath', data)
    })
    fs.readFile(returnAePath, (err, data) => {
      if (err) {
        myConsole.log(err)
        return
      }
      mainWindow.webContents.send('returnAePath', data)
      i++
      returnAePath = returns + i.toString() + '.png'
      if (i === (g + 2)) {
        myConsole.log('i===g+2')
        clearInterval(t)
      }
    })
  }, 1000)
})

// 监听视频处理 返回矫正视频,对比视频
ipcMain.on('transVideoData', (e, f) => {
  myConsole.log(f)
  let returns = process.cwd() + '/temp/'
  let AeVideo = returns + 'result.mp4'
  let CmpVideo = returns + 'cmp.mp4'
  fs.readFile(CmpVideo, (err, data) => {
    if (err) {
      myConsole.log(err)
      // mainWindow.webContents.send('CmpVideofalse', data)
      return
    }
    mainWindow.webContents.send('returnCmpVideo', data)
    myConsole.log('returnCmpVideo' + CmpVideo)
  })
  fs.readFile(AeVideo, (err, data) => {
    if (err) {
      myConsole.log(err)
      // mainWindow.webContents.send('AeVideofalse', data)
      return
    }
    mainWindow.webContents.send('returnAeVideo', data)
    myConsole.log('returnAeVideo ' + AeVideo)
  })
})

// 监听停止 调用停止算法 无返回
ipcMain.on('stop', (e, f) => {
  execFile(process.cwd() + '\\distortion\\distortion_cpp.exe', ['--cli', 'abort'], (err, stdout, stderr) => {
    if (err) {
      myConsole.log(err)
      myConsole.log(`stdout: ${stdout}`)
      return
    }
    myConsole.log(`stdout: ${stdout}`)
    myConsole.log('stop')
  })
  clearInterval(t)
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

// 检测 temp文件夹是否存在
if (!fsExistsSync('temp')) {
  fs.mkdir('temp')
}

// 检测 tempimg文件夹是否存在
if (!fsExistsSync('tempimg')) {
  fs.mkdir('tempimg')
}
