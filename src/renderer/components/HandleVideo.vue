<template>
  <div id="handleVideo"> 
    <main>
      <!-- 上传区域 -->
      <!-- 显示图片 -->
      <div class="upload-area" v-if="isShowImg">
        <!-- 不显示对比 -->
        <img v-bind:src="returnSrcPath" v-if="!isShowImgRed"/>
        <!-- 显示对比 -->
        <canvas id="srcCanvas" width="500px" height="500px" v-if="isShowImgRed"></canvas>
      </div>
      <!-- 显示视频 -->
      <div class="upload-area" v-if="!isShowImg">
        <!-- 显示对比 -->
        <video id="cmpVideo" controls="controls"
          v-bind:src="returnCmpVideo" v-if="isShowVideoRed"
          @timeupdate="handleVideopro('cmpVideo')"></video>
        <!-- 不显示对比 -->
        <div v-if="!isShowVideoRed">
          <!-- 显示上传视频 -->
          <div v-if="isShowUploadVideo" > 
            <video id="uploadVideo" controls="controls" 
              v-bind:src="filePath" v-if="!isShowImg"
              @timeupdate="handleTimeUpdate"></video>
          </div>
          <!-- 不显示上传视频 -->
          <el-upload action="" 
            v-if="!isShowUploadVideo" :on-change="upload" :auto-upload="false">
            <el-button type="primary" round icon="el-icon-upload">点击上传文件</el-button>
          </el-upload>
        </div>
      </div>
      <!-- 输出结果区域 -->
      <div class="show-area">
        <!-- 显示图片 -->
        <img v-bind:src="returnAePath" v-if="isShowImg"/>
        <!-- 显示视频 -->
        <video id="aeVideo" controls="controls"
          v-bind:src="returnAeVideo" v-if="!isShowImg"></video>
      </div>
    </main>
    <!-- 标签区域 -->
    <div class="label" v-if="isShowImg">
      <el-tag v-if="!isShowImgRed">采样图像</el-tag>
      <el-tag v-if="isShowImgRed">采样对比</el-tag>
      <el-tag>采样矫正过程</el-tag>
    </div>
    <div class="label" v-if="!isShowImg">
      <el-tag v-if="!isShowVideoRed">原视频</el-tag>
      <el-tag v-if="isShowVideoRed">矫正视频对比</el-tag>
      <el-tag>矫正视频</el-tag>
    </div>
    <!-- 重新上传视频 -->
    <div class="re-uploadVideo">
      <el-upload action="" :show-file-list=false
        v-if="isShowUploadVideo" :on-change="upload" :auto-upload="false">
        <el-button type="primary" round icon="el-icon-upload" size="mini">重新上传文件</el-button>
      </el-upload>
    </div>
    <!-- 是否启用对比 -->
    <div class="is-genetic2">
      <el-switch 
        active-color="#409eff" inactive-color="#dcdfe6" active-text="采样对比"
        v-model="isShowImgRed" @change="switchChange()"></el-switch>
      <el-switch style="margin-left: 20px"
        active-color="#409eff" inactive-color="#dcdfe6" active-text="视频对比"
        v-model="isShowVideoRed" @change="switchChange()"></el-switch>
    </div>
    <!-- 参数区域 -->
    <div class="input-data">
      <!-- 预设按钮 -->
      <div class="pre">
        <el-button type="primary" round icon="el-icon-folder" size="mini" 
          @click="saveDialogVisible = true">保存预设</el-button>
        <el-button type="primary" round icon="el-icon-folder-opened" size="mini" 
          @click="importDialogVisible = true">导入预设</el-button>
      </div>
      <!-- 畸变参数 -->
      <div class="parameter-area1">
        <div class="data1">畸变参数 k1</div>
        <el-slider class="value1" show-input input-size="mini"
          :min=-1 :max=1 :step=0.01 v-model="currentData.parameter1"></el-slider>
        <div class="data1">畸变参数 k2</div>
        <el-slider class="value1" show-input input-size="mini"
          :min=-1 :max=1 :step=0.01 v-model="currentData.parameter2"></el-slider>
      </div>
      <!-- 畸变中心坐标 -->
      <div class="parameter-area1">
        <div class="data1">畸变中心坐标X</div>
        <el-slider class="value1" show-input input-size="mini"
          :min=0 :max=1 :step=0.01 v-model="currentData.valueX"></el-slider>
        <div class="data1">畸变中心坐标Y</div>
        <el-slider class="value1" show-input input-size="mini"
          :min=0 :max=1 :step=0.01 v-model="currentData.valueY"></el-slider>
      </div>
      <!-- 遗传算法or演化策略 -->
      <div class="is-genetic">
        <el-switch class="is-area" 
          active-text="遗传算法" inactive-text="演化策略"
          active-color="#409eff" inactive-color="#dcdfe6"
          v-model="currentData.isGenetic"></el-switch>
      </div>
      <!-- 遗传算法参数调整 -->
      <div v-if="currentData.isGenetic">
        <!-- 遗传变异交叉概率 -->
        <div class="parameter-area2" >
          <div class="data1">遗传的变异概率</div>
          <el-slider class="value1" show-input input-size="mini" label="遗传的变异概率"
            :min=0 :max=1 :step=0.01 v-model="currentData.genProM"></el-slider>
          <div class="data1">遗传的交叉概率</div>
          <el-slider class="value1" show-input input-size="mini"
            :min=0 :max=1 :step=0.01 v-model="currentData.genProC"></el-slider>
        </div>
        <!-- 遗传种群代数参数 -->
        <div class="parameter-area2">
          <div class="data1">种群大小</div>
          <el-slider class="value2" show-input input-size="mini"
            :min=0 :max=200 v-model="currentData.genPopulation"></el-slider>
        </div>
        <div class="parameter-area2">
          <div class="data1">演化代数</div>
          <el-slider class="value2" show-input input-size="mini"
            :min=0 :max=100 v-model="currentData.genGenerate"></el-slider>
        </div>
        <!-- 退火算法参数调整 -->
        <div class="is-genetic">
        <el-switch class="is-area2" 
          active-color="#409eff" inactive-color="#dcdfe6"
          active-text="启用模拟退火算法"
          v-model="currentData.isAnnealing"></el-switch>
        </div>
        <div v-if="currentData.isAnnealing" >
          <div class="parameter-area2">
            <div class="data1">初始温度</div>
            <el-slider class="value2" show-input input-size="mini"
              :min=0 :max=6000 v-model="currentData.startTemperature"></el-slider>
          </div>
          <div class="parameter-area2">
            <div class="data1">终止温度</div>
            <el-slider class="value2" show-input input-size="mini"
              :min=0 :max=0.001 :step=0.0001  v-model="currentData.endTemperature"></el-slider>
          </div>
          <div class="parameter-area2">
            <div class="data1">降温速度</div>
            <el-slider class="value2" show-input input-size="mini"
              :min=0 :max=1 :step=0.01 v-model="currentData.coolingRate"></el-slider>
          </div>
        </div>
      </div>
      <!-- 演化策略参数调整 -->
      <div v-if="!currentData.isGenetic" >
        <div class="parameter-area2">
          <div class="data1">种群大小</div>
          <el-slider class="value2" show-input input-size="mini"
            :min=0 :max=200 v-model="currentData.evoPopulation"></el-slider>
        </div>
        <div class="parameter-area2">
          <div class="data1">演化代数</div>
          <el-slider class="value2" show-input input-size="mini"
            :min=0 :max=100 v-model="currentData.evoGenerate"></el-slider>
        </div>
      </div>
    </div>
    <!-- 开始停止按钮 -->
    <div class="button-area">
      <!-- 确认采样 -->
      <el-button type="primary" round icon="el-icon-check" size="medium"
        @click="transSampleData()">确认采样</el-button>
      <el-button type="primary" round icon="el-icon-video-play" size="medium" 
        @click="transVideoData()">开始处理</el-button>
      <el-button type="primary" round icon="el-icon-video-pause" size="medium" 
        @click="stop()">停止处理</el-button>
    </div>
    <!-- 保存预设弹窗 -->
    <el-dialog title="保存预设" width="30%" 
      :visible.sync="saveDialogVisible" :before-close="handleClose">
      <el-input v-model="preName" placeholder="请输入预设名称"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 导入预设弹窗 -->
    <el-dialog title="导入预设" width="30%" 
      :visible.sync="importDialogVisible" :before-close="handleClose">
      <el-select v-model="value" placeholder="请选择">
        <el-option v-for="item in preList" 
          :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="importData()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  // import { Loading } from 'element-ui'
  export default {
    name: 'HandleVideo',
    data () {
      return {

        // 当前参数
        currentData: {

          // 畸变参数k1,k2
          parameter1: 0.3,
          parameter2: 0.02,

          // 畸变中心cx,cy
          valueX: 0.5,
          valueY: 0.5,

          // 是否启用遗传算法
          isGenetic: false,

          // 变异概率,交叉概率
          genProM: 0.65,
          genProC: 0.08,

          // 遗传算法参数
          genPopulation: 50,
          genGenerate: 40,

          // 是否启用模拟退火算法
          isAnnealing: false,

          // 退火算法参数
          startTemperature: 3000,
          endTemperature: 0.00000001,
          coolingRate: 0.98,

          // 演化策略参数
          evoPopulation: 40,
          evoGenerate: 40
        },

        // 预设下标
        preIndex: 0,

        // 预设名字输入
        preName: '',

        // 预设个数统计
        count: 0,

        // 是否显示预设弹窗
        saveDialogVisible: false,
        importDialogVisible: false,

        // 预设选择框数据列表
        preList: [],

        // 预设名字
        value: '',

        // 是否显示上传视频
        isShowUploadVideo: false,

        // 文件路径
        filePath: '',

        // 本地文件路径
        localPath: '',

        // 当前视频数据
        videoInfo: {
          duration: 0,
          currentTime: 0,
          precent: 0
        },

        // 畸变视频数据
        aeVideoInfo: {
          duration: 0,
          currentTime: 0
        },

        // 采样时间点百分比
        sampleTimePoint: 0,

        // 返回的图片或者视频url
        returnSrcPath: '',
        returnAePath: '',
        aeOnloadPath: '',
        returnAeVideo: '',
        returnCmpVideo: '',

        // 是否显示处理完的样本图片
        isShowImg: false,

        // 是否显示对比
        isShowImgRed: false,
        isShowVideoRed: false,

        canPlay: false
        // clockNum: null,
        // loadingInstance: null
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      handleClose (done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done()
          })
          .catch(_ => {})
      },
      // 加载预设列表
      loadpreList () {
        let myStorage = window.localStorage
        let getList = JSON.parse(myStorage.getItem('preList'))
        if (getList != null) {
          this.preList = getList
        }
        if (myStorage.getItem('count') != null) {
          this.count = myStorage.getItem('count')
        }
      },
      // 保存预设函数
      saveData () {
        let myStorage = window.localStorage
        this.preIndex = this.count
        this.preList.push({value: this.preIndex, label: this.preName, predata: this.currentData})
        let preListToJson = JSON.stringify(this.preList)
        myStorage.setItem('preList', preListToJson)
        this.saveDialogVisible = false
        this.count++
        myStorage.setItem('count', this.count)
      },
      // 导入预设函数
      importData () {
        let myStorage = window.localStorage
        let getData = JSON.parse(myStorage.getItem('preList'))
        this.preList = getData
        for (let index = 0; index < getData.length; index++) {
          if (getData[index].value === this.value) {
            for (let key in this.currentData) {
              this.currentData[key] = getData[index].predata[key]
            }
          }
        }
        this.importDialogVisible = false
      },
      // 控制对比启用开关
      switchChange () {
        if (this.isShowVideoRed === true) {
          this.isShowImgRed = false
        }
        if (this.isShowImgRed === true) {
          this.isShowVideoRed = false
        }
      },
      // 上传文件
      upload (file) {
        this.localPath = file.raw.path
        ipcRenderer.send('on-upload-video', file.raw.path)
        this.isShowUploadVideo = true
        let url = URL.createObjectURL(file.raw)
        this.filePath = url
        this.isShowImg = false
        this.isShowImgRed = false
        this.isShowVideoRed = false
        console.log(this.isShowImg)
        let t = setInterval(() => {
          let uploadVideo = document.getElementById('uploadVideo')
          if (uploadVideo != null) {
            this.videoInfo.currentTime = uploadVideo.currentTime
            this.videoInfo.duration = uploadVideo.duration
            clearInterval(t)
          }
        }, 500)
      },
      // 实时获取视频进度百分比
      handleTimeUpdate () {
        let uploadVideo = document.getElementById('uploadVideo')
        this.sampleTimePoint = uploadVideo.currentTime / uploadVideo.duration
        console.log(this.canPlay)
        if (this.canPlay === true) {
          this.handleVideopro('uploadVideo')
        }
      },
      // 左右视频同步 较为卡顿还需优化
      handleVideopro (videoID) {
        let myVideo = document.getElementById(videoID)
        // this.aeVideoInfo.duration = myVideo.duration
        // this.aeVideoInfo.currentTime = myVideo.currentTime
        let myVideo2 = document.getElementById('aeVideo')
        myVideo2.currentTime = myVideo.currentTime
        console.log(myVideo2.currentTime)
      },
      // 确认采样后调用 向主进程发送信息 调用矫正算法
      transSampleData () {
        this.isShowImg = false
        ipcRenderer.send('transSampleData', {
          filePath: this.localPath,
          sampleTimePoint: this.sampleTimePoint,
          preData: this.currentData
        })
      },
      // 开始处理后调用 向主进程发送信息 获取矫正视频,对比视频
      transVideoData () {
        ipcRenderer.send('transVideoData', {
          filePath: this.localPath,
          sampleTimePoint: this.sampleTimePoint,
          preData: this.currentData
        })
        // let t = setInterval(() => {
        //   let myAeVideo = document.getElementById('aeVideo')
        //     if (myAeVideo.)
        // }, 500)
      },
      // 获得矫正图像 监听主进程发送的信息
      getReturnSample () {
        ipcRenderer.on('returnSrcPath', (e, m) => {
          let file = new File([m], 'show.png', { type: 'image/png' })
          let url = URL.createObjectURL(file)
          this.returnSrcPath = url
        })
        ipcRenderer.on('returnAePath', (e, m) => {
          let file = new File([m], 'show.png', { type: 'image/png' })
          let url = URL.createObjectURL(file)
          this.returnAePath = url
          this.isShowImg = true
          this.drawRed()
        })
      },
      // 对比标红算法 利用 canvas 的 api 获取两张图片的像素数据
      // 两张图片的像素相减的绝对值附加到原图像素数据的 R 通道 实现标红
      drawRed () {
        let url = this.returnAePath
        let srcImgData, aeImgData
        let srcImg = new Image()
        srcImg.src = this.returnSrcPath
        let srcCanvas = document.getElementById('srcCanvas')
        if (srcCanvas === null) {
          return
        }
        let srcContext = srcCanvas.getContext('2d')
        srcImg.onload = function () {
          srcCanvas.width = srcImg.naturalWidth
          srcCanvas.height = srcImg.naturalHeight
          srcContext.drawImage(srcImg, 0, 0, srcImg.naturalWidth, srcImg.naturalHeight)
          srcImgData = srcContext.getImageData(0, 0, srcImg.naturalWidth, srcImg.naturalHeight)
          let aeImg = new Image()
          aeImg.src = url
          let aeCanvas = document.createElement('canvas')
          let aeContext = aeCanvas.getContext('2d')
          aeImg.onload = function () {
            aeCanvas.width = aeImg.naturalWidth
            aeCanvas.height = aeImg.naturalHeight
            aeContext.drawImage(aeImg, 0, 0, aeImg.naturalWidth, aeImg.naturalHeight)
            aeImgData = aeContext.getImageData(0, 0, aeImg.naturalWidth, aeImg.naturalHeight)
            let r, g, b
            for (let index = 0; index < srcImgData.data.length; index += 4) {
              r = Math.abs(srcImgData.data[index] - aeImgData.data[index])
              g = Math.abs(srcImgData.data[index + 1] - aeImgData.data[index + 1])
              b = Math.abs(srcImgData.data[index + 2] - aeImgData.data[index + 2])
              srcImgData.data[index] = srcImgData.data[index] + r + g + b
            }
            srcContext.putImageData(srcImgData, 0, 0)
          }
        }
      },
      // 获得矫正视频,对比视频 监听主进程发送的信息
      getReturnVideo () {
        ipcRenderer.on('returnAeVideo', (e, m) => {
          let file = new File([m], 'show.mp4', { type: 'video/mp4' })
          let url = URL.createObjectURL(file)
          this.returnAeVideo = url
          console.log(m)
          console.log(file)
          this.isShowImg = false
          this.canPlay = true
          // this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
          //   this.loadingInstance.close()
          // })
        })
        ipcRenderer.on('returnCmpVideo', (e, m) => {
          let file = new File([m], 'showcmp.mp4', { type: 'video/mp4' })
          let url = URL.createObjectURL(file)
          this.returnCmpVideo = url
          console.log(m)
          console.log(file)
          this.isShowImg = false
          // this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
          //   this.loadingInstance.close()
          // })
          clearInterval(this.clockNum)
        })
      },
      // 获取返回视频是否存在
      // getReturnVideoStatus () {
      //   ipcRenderer.on('AeVideofalse', (e, m) => {
      //     let myAeVideo = document.getElementById('aeVideo')
      //     this.loadingInstance = Loading.service(myAeVideo)
      //   })
      //   ipcRenderer.on('CmpVideofalse', (e, m) => {
      //     let myCmpVideo = document.getElementById('cmpVideo')
      //     this.loadingInstance = Loading.service(myCmpVideo)
      //   })
      // },
      // 停止矫正调用 向主进程发送信息 调用停止算法
      stop () {
        ipcRenderer.send('stop', 'stop the project')
      }
    },
    // 程序初始化时调用
    created () {
      this.loadpreList()
      this.getReturnSample()
      this.getReturnVideo()
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #handleVideo {
    background: white;
    height: 100vh;
    width: 100vw;
  }

  main{
    margin: 20px;
    height: 50vh;
    display: flex;
    justify-content: center;
  }

  .upload-area{
    width: 48%;
    height: 50vh;
    line-height: 50vh;
    text-align: center;
    border: 2px solid;
    border-color: #409eff;
    /* background: linear-gradient(white,white) padding-box,
    repeating-linear-gradient(-45deg,#409eff 0, #409eff 0.25em,white 0,white 0.75em); */
  }

  .show-area{
    width: 47%;
    height: 50vh;
    line-height: 50vh;
    text-align: center;
    border: 2px solid;
    border-color: #409eff;
    border-left-width: 0;
    /* background: linear-gradient(white,white) padding-box,
    repeating-linear-gradient(-45deg,#409eff 0, #409eff 0.25em,white 0,white 0.75em); */
  }

  video {
    /* width: 400px; */
	  height: 320px;
	  max-width: 100%;
	  max-height: 100%;
  }

  canvas {
    position: relative;
    top: 0px;
    left: 0px;
  }

  .re-uploadVideo{
    margin: auto;
    text-align: center;
  }

  .sampling {
    margin:10px 30px;
    display: flex;
    justify-content: flex-start;
  }

  .checkbtn{
    height: 28px;
    margin: 5px 45px;
  }

  .pre{
    margin:10px 60px;
    display: flex;
    justify-content: flex-start;
  }

  .parameter-area1 {
    margin: 10px 30px;
    display: flex;
    justify-content: flex-start;
  }

  .parameter-area2 {
    margin: 10px 50px;
    display: flex;
    justify-content: flex-start;
  }

  .data1 {
    margin: 0px 30px;
    line-height: 38px;
    font-size: 14px;
  }

  .data2{
    margin: 0px 30px;
  }

  .value1 {
    width: 400px;
  }

  .value2{
    width: 600px;
  }

  .is-genetic{
    margin: 20px 0px;
    display: flex;
    justify-content: flex-start;
  }

  .is-genetic2 {
    margin: 20px 60px;
    display: flex;
    justify-content: flex-start;
  }

  .is-area2{
    margin: 20px 80px;
    display: flex;
    justify-content: flex-start;
  }

  .is-population{
    margin: 0px 30px;
  }

  .button-area{
    display: flex;
    justify-content: space-between;
    margin: 50px 280px;
    font-size: 16px;
  }

  #srcCanvas {
    width: auto;
	  height: auto;
	  max-width: 100%;
	  max-height: 100%;
  }
</style>
