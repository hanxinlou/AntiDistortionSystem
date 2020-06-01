<template>
<div class="distortion">
  <main>
    <!-- 原图 -->
    <!-- 显示畸变对比 -->
    <div class="upload-area" v-if="isShowRed">
      <canvas id="srcCanvas" width="500px" height="500px"></canvas>
    </div>
    <!-- 不显示畸变对比 -->
    <div class="upload-area" v-if="!isShowRed">
      <img id="uploadImg" v-bind:src="filePath" v-if="isShowUploadImg"/>
      <el-upload action="" 
        v-if="!isShowUploadImg" :on-change="upload" :auto-upload="false">
        <el-button type="primary" round icon="el-icon-upload">点击上传图片</el-button>
      </el-upload>
    </div>
    <!-- 畸变处理之后 -->
    <div class="show-area">
      <img v-bind:src="returnPath"/>
    </div>
  </main>
  <!-- 标签区域 -->
  <div class="label">
    <el-tag v-if="isShowRed">畸变对比图</el-tag>
    <el-tag v-if="!isShowRed">原图像</el-tag>
    <el-tag>畸变图像</el-tag>
  </div>
  <!-- 矫正区域 -->
  <main v-if="isCorrect">
    <!-- 显示反畸变对比 -->
    <div class="upload-area" v-if="isShowAntiRed">
      <canvas id="srcCanvas2" width="500px" height="500px"></canvas>
    </div>
    <!-- 不显示反畸变对比 -->
    <div class="upload-area" v-if="!isShowAntiRed">
      <img v-bind:src="returnPath"/>
    </div>
    <!-- 反畸变处理之后 -->
    <div class="show-area">
        <img v-bind:src="returnCorrectPath"/>
    </div>
  </main>
  <!-- 标签区域 -->
  <div class="label" v-if="isCorrect">
    <el-tag v-if="isShowRed">与畸变图像对比</el-tag>
    <el-tag v-if="!isShowRed">畸变图像</el-tag>
    <el-tag>矫正图像</el-tag>
  </div>
  <main v-if="isCorrect">
    <!-- 显示反畸变对比 -->
    <div class="upload-area" v-if="isShowAntiRed">
      <canvas id="srcCanvas3" width="500px" height="500px"></canvas>
    </div>
    <!-- 不显示反畸变对比 -->
    <div class="upload-area" v-if="!isShowAntiRed">
      <img v-bind:src="filePath"/>
    </div>
    <!-- 反畸变处理之后 -->
    <div class="show-area">
        <img v-bind:src="returnCorrectPath"/>
    </div>
  </main>
  <!-- 标签区域 -->
  <div class="label" v-if="isCorrect">
    <el-tag v-if="isShowRed">与原图对比</el-tag>
    <el-tag v-if="!isShowRed">原图像</el-tag>
    <el-tag>矫正图像</el-tag>
  </div>
  <!-- 重新上传图片 -->
  <div class="re-uploadImg">
    <el-upload action="" :show-file-list=false
      v-if="isShowUploadImg" :on-change="upload" :auto-upload="false">
      <el-button type="primary" round class="el-icon-upload" size="mini">重新上传图片</el-button>
    </el-upload>
  </div>
  <!-- 是否开启对比 -->
  <div class="is-area">
    <el-switch class="is-population-data" 
        active-color="#409eff" inactive-color="#dcdfe6" active-text="畸变对比"
        v-model="isShowRed" @change="changeParameter()"></el-switch>
    <el-switch class="is-population-data" 
        active-color="#409eff" inactive-color="#dcdfe6" active-text="反畸变对比"
        v-model="isShowAntiRed" ></el-switch>
  </div>
  <div class="input-data">
    <!-- 畸变参数 -->
    <div class="parameter-area1">
      <div class="data1">畸变参数 k1</div>
      <el-slider class="value1" show-input input-size="mini"
        :min=-1 :max=1 :step=0.01 v-model="currentData.parameter1" 
        @change="changeParameter()"></el-slider>
      <div class="data1">畸变参数 k2</div>
      <el-slider class="value1" show-input input-size="mini"
        :min=-1 :max=1 :step=0.01 v-model="currentData.parameter2"
        @change="changeParameter()"></el-slider>
    </div>
    <!-- 畸变中心坐标 -->
    <div class="parameter-area1">
      <div class="data1">畸变中心坐标X</div>
      <el-slider class="value1" show-input input-size="mini"
        :min=0 :max=1 :step=0.01 v-model="currentData.valueX"
        @change="changeParameter()"></el-slider>
      <div class="data1">畸变中心坐标Y</div>
      <el-slider class="value1" show-input input-size="mini"
        :min=0 :max=1 :step=0.01 v-model="currentData.valueY"
        @change="changeParameter()"></el-slider>
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
  <div class="button-area">
      <!-- 确认采样 -->
      <el-button type="primary" round icon="el-icon-video-play" size="medium" 
        @click="correctImg()">开始处理</el-button>
      <el-button type="primary" round icon="el-icon-video-pause" size="medium" 
        @click="stop()">停止处理</el-button>
    </div>
</div>
</template>

<script>
import {ipcRenderer} from 'electron'
export default {
  name: 'Distortion',
  data () {
    return {

      // 算法参数
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

      // 是否显示上传的图片
      isShowUploadImg: false,

      // 文件路径
      filePath: '',

      // 本地文件路径
      localPath: '',

      // 返回的畸变图片路径
      returnPath: '',

      // 返回的矫正图片路径
      returnCorrectPath: '',

      // 是否显示对比标红
      isShowRed: false,
      isShowAntiRed: false,

      // 是否开始矫正
      isCorrect: false
    }
  },
  methods: {
    // 上传图片
    upload (file) {
      this.localPath = file.raw.path
      this.isShowUploadImg = true
      let url = URL.createObjectURL(file.raw)
      this.filePath = url
      this.changeParameter()
    },
    // 基础参数修改时调用 向主进程发送信息 调用畸变算法
    changeParameter () {
      if (this.localPath === '') {
        return
      }
      console.log('changep')
      ipcRenderer.send('transImgData', {
        filePath: this.localPath,
        preData: this.currentData
      })
    },
    // 获得畸变图像 监听主进程发送的信息
    getReturnAeImg () {
      ipcRenderer.on('returnAeImg', (e, m) => {
        var file = new File([m], 'show.png', { type: 'image/png' })
        let url = URL.createObjectURL(file)
        this.returnPath = url
        console.log(this.returnPath)
        this.drawRed(this.filePath, url, 'srcCanvas')
      })
    },
    // 对比标红算法 利用 canvas 的 api 获取两张图片的像素数据
    // 两张图片的像素相减的绝对值附加到原图像素数据的 R 通道 实现标红
    drawRed (path1, path2, name) {
      let srcImgData, aeImgData
      let srcImg = new Image()
      srcImg.src = path1
      let srcCanvas = document.getElementById(name)
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
        aeImg.src = path2
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
    // 开始处理调用 向主进程发送信息 调用矫正算法
    correctImg () {
      // let str = this.localPath.split('\\')
      // let p = process.cwd() + '/tempimg/' + str[str.length - 1]
      this.isCorrect = true
      // if (this.returnPath === '') {
      // return
      // }
      ipcRenderer.send('transAeData', {
        filePath: this.localPath,
        preData: this.currentData
      })
    },
    // 获得矫正图像 监听主进程发送的信息
    getCorrectImg () {
      ipcRenderer.on('returnCorrectImg', (e, m) => {
        let file = new File([m], 'show.png', { type: 'image/png' })
        let url = URL.createObjectURL(file)
        this.returnCorrectPath = url
        this.isShowImg = true
        this.drawRed(this.returnPath, url, 'srcCanvas2')
        this.drawRed(this.filePath, url, 'srcCanvas3')
      })
    },
    // 停止矫正调用 向主进程发送信息 调用停止算法
    stop () {
      ipcRenderer.send('stop', 'stop the project')
    }
  },
  // 程序初始化时调用
  created () {
    this.getReturnAeImg()
    this.getCorrectImg()
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

  #distortion {
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

  canvas {
    position: relative;
    top: 0px;
    left: 0px;
  }

  img{
    width: auto;
	  height: auto;
	  max-width: 100%;
	  max-height: 100%;
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

  .label {
    display: flex;
    justify-content:space-around
  }

  .re-uploadImg{
    margin: auto;
    text-align: center;
  }

  .parameter-area1 {
    margin: 10px 30px;
    display: flex;
    justify-content: flex-start;
  }

  .data1 {
    margin: 0px 30px;
    line-height: 38px;
  }

  .value1 {
    width: 400px;
  }

  .is-area{
    margin: 20px 60px;
    display: flex;
    justify-content: flex-start;
  }

  #srcCanvas {
    width: auto;
	  height: auto;
	  max-width: 100%;
	  max-height: 100%;
  }

  #srcCanvas2 {
    width: auto;
	  height: auto;
	  max-width: 100%;
	  max-height: 100%;
  }

  #srcCanvas3 {
    width: auto;
	  height: auto;
	  max-width: 100%;
	  max-height: 100%;
  }

  .is-population-data {
    margin-right: 100px;
  }
</style>
