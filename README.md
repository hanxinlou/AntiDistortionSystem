# anti-distortion

> An electron-vue project

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

## 简介

### VR视频反畸变校正演示系统

> 用于研究VR设备中存在的图像畸变和畸变校正算法,可展示畸变矫正算法的效果

## 技术选型
- Electron-Vue
- Node.js

## 功能(算法效果可视化)

### 图像处理
- 根据所给图像和可交互基础参数实时输出畸变图像和畸变对比图(用于研究图像畸变原理)
- 根据所给畸变图像和可交互参数输出矫正过程和反畸变对比图(矫正算法可视化)
### 视频处理
- 根据所给视频采样点和可交互参数输出矫正过程和反畸变对比图(矫正算法可视化)
- 根据所给视频和可交互参数输出矫正视频和对比视频(矫正算法可视化)
- 预设功能,方便用户载入上次所调参数数据

## 难点

### 1.如何实现两张图像的对比图
#### 解决方案:
- 利用 `canvas` 自带的 `Web API`--`getimagedata()` 获取图片的像素数据
- 将两张图像的像素数据相减的绝对值添加到原图像素数据的 `R` 通道
- 利用 `canvas` 自带的 `Web API`--`putimagedata()` 将新数据画入 `canvas`

### 2.如何实现读取本地文件(涉及跨域)
#### 解决方案A 针对于利用 `upload` 组件上传的文件
- 根据 `upload` 返回的参数 `file` 获得本地路径 `file.raw.path` 和 `file.raw` 对象
- 利用 `URL.createObjectURL(file.raw)` 获得图片/视频的 `URL` ( `Blob` 对象)
- 将获得的 `URL` 赋给 `img` 或 `canvas` 标签的 `src`
#### 解决方案B 针对只有本地路径的文件
- 利用 `Node.js` 的 `fs` 模块中异步读取文件方法 `fs.readFile` 读取文件返回 `data` 
- 利用 `new File` 获得文件流 `file`
- 利用  `URL.createObjectURL(file)` 获得图片/视频的 `URL`

### 3.Electron主进程与渲染进程之间的通信
#### 渲染进程向主进程发送消息
- 渲染进程引入 `ipcRenderer`, 利用 `ipcRenderer.send('message', data)`向主进程发送消息
- 主进程引入 `ipcMain` , 利用 `ipcMain.on('message', (e, f) => {})` 监听渲染进程发送消息的事件
#### 主进程向渲染进程发送消息
- 主进程利用 `mainWindow.webContents.send('message', data)` 向渲染进程发送消息
- 渲染进程引入 `ipcRenderer`, 利用 `ipcRenderer.on('message', data)`监听主进程发送消息的事件

### 4.异步同步问题
由于算法运行需要一定的时间, 考虑异步操作会更符合需求

### 5. `this` 实例指向问题
`this` 指向当前作用域的实例而不是指向 `Vue` 实例, 写代码时若要用 `this` 则需要仔细考虑 `this` 指向的实例

### 6.如何存储预设数据(下次启动客户端 数据仍存在)
#### 解决方案:
- 采用 `windows` 自带的 `localStorge` 字典存储 键值一一对应
- localStorage是html5提供的一种本地存储的方法，可以把数据存储在本地浏览器，下次打开后仍然可以获取到存储的数据，如果在存储的数据 量小的时候可以起到代替数据库的功能，比cookies更有优越性。
- localStorage只能存储字符串的数据，对于JS中常用的数组或对象却不能直接存储
- 可以通过JSON对象提供的parse和stringify进行对象和字符串的转换，进行数据存取
- 加载数据是先判断获取的数据是否为空 浏览器过一段时间会定时清除
```js
  // 存储数据
  window.localStorage.setItem('name', data)
  // 读取数据
  window.localStorage.getItem('name')
```
## 待优化
- [ ] 图片加载过慢 `img` 标签读取图片像素数据的方式 或许可以用 `canvas` 标签
- [ ] 视频同步卡顿  暂时没有想法
- [ ] 加载中的交互逻辑 可以添加 `loading` 组件

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
