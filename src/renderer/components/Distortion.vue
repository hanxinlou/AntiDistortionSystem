<template>
<div class="distortion">
  <main>
    <!-- 原图 -->
    <div class="upload-area" v-if="isShowRed">
      <canvas id="srcCanvas" width="500px" height="500px"></canvas>
    </div>
    <div class="upload-area" v-if="!isShowRed">
      <img id="uploadImg" v-bind:src="filePath" v-if="isShowUploadImg"/>
      <el-upload action="" 
        v-if="!isShowUploadImg" :on-change="upload" :auto-upload="false">
        <el-button type="primary" round class="el-icon-upload">点击上传图片</el-button>
      </el-upload>
    </div>
    <!-- 畸变处理之后 -->
    <div class="show-area">
      <img v-bind:src="returnPath"/>
    </div>
  </main>
  <!-- 重新上传图片 -->
  <div class="re-uploadImg">
    <el-upload action="" :show-file-list=false
      v-if="isShowUploadImg" :on-change="upload" :auto-upload="false">
      <el-button type="primary" round class="el-icon-upload" size="mini">重新上传图片</el-button>
    </el-upload>
  </div>
  <div class="is-area">
    <el-switch class="is-population-data" 
        active-color="#409eff" inactive-color="#dcdfe6" active-text="对比"
        v-model="isShowRed" @change="changeParameter()"></el-switch>
  </div>
  <!-- 参数区域 -->
  <div class="input-data">
    <!-- 畸变参数 -->
    <div class="parameter-area1">
      <div class="data1">畸变参数 k1</div>
      <el-slider class="value1" show-input :debounce=500 input-size="mini"
        v-model="parameter1" :min=-1 :max=1 :step=0.01 @change="changeParameter()"></el-slider>
      <div class="data1">畸变参数 k2</div>
      <el-slider class="value1" show-input :debounce=500 input-size="mini"
        v-model="parameter2" :min=-1 :max=1 :step=0.01 @change="changeParameter()"></el-slider>
    </div>
    <!-- 畸变中心坐标 -->
    <div class="parameter-area1">
      <div class="data1">畸变中心坐标X</div>
      <el-slider class="value1" show-input input-size="mini"
        v-model="valueX" :min=0 :max=1 :step=0.01 @change="changeParameter()"></el-slider>
      <div class="data1">畸变中心坐标Y</div>
      <el-slider class="value1" show-input input-size="mini"
        v-model="valueY" :min=0 :max=1 :step=0.01 @change="changeParameter()"></el-slider>
    </div>
  </div>
</div>
</template>

<script>
import {ipcRenderer} from 'electron'
export default {
  name: 'Distortion',
  data () {
    return {
      // 畸变参数
      parameter1: 0,
      parameter2: 0,

      // 畸变中心坐标
      valueX: 0,
      valueY: 0,

      // 是否显示上传的图片
      isShowUploadImg: false,

      // 文件路径
      filePath: '',

      // 本地文件路径
      localPath: '',

      // 返回的图片路径
      returnPath: '',

      // 是否显示对比标红
      isShowRed: false
    }
  },
  methods: {
    upload (file) {
      this.localPath = file.raw.path
      this.isShowUploadImg = true
      let url = URL.createObjectURL(file.raw)
      this.filePath = url
      this.changeParameter()
    },
    changeParameter () {
      if (this.localPath === '') {
        return
      }
      ipcRenderer.send('transImgData', {
        filePath: this.localPath,
        K1: this.parameter1,
        K2: this.parameter2,
        CX: this.valueX,
        CY: this.valueY
      })
    },
    getReturnImg () {
      ipcRenderer.on('returnImg', (e, m) => {
        var file = new File([m], 'show.png', { type: 'image/png' })
        let url = URL.createObjectURL(file)
        this.returnPath = url
        this.drawRed(url)
      })
    },
    drawRed (path) {
      let srcImgData, aeImgData
      let srcImg = new Image()
      srcImg.src = this.filePath
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
        aeImg.src = path
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
    }
  },
  created () {
    this.getReturnImg()
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
    border: 5px dashed transparent;
    background: linear-gradient(white,white) padding-box,
    repeating-linear-gradient(-45deg,#409eff 0, #409eff 0.25em,white 0,white 0.75em);
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
    border: 5px dashed transparent;
    border-left-width: 0;
    background: linear-gradient(white,white) padding-box,
    repeating-linear-gradient(-45deg,#409eff 0, #409eff 0.25em,white 0,white 0.75em);
  }

  .re-uploadImg{
    margin:10px 500px 10px 290px
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
</style>
