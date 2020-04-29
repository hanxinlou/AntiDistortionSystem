<template>
<div class="distortion">
  <main>
    <!-- 原图 -->
    <div class="upload-area">
      <img id="uploadImg" v-bind:src="filePath"  v-if="isShowUploadImg"/>
      <el-upload action="" 
        v-if="!isShowUploadImg" :on-change="upload" :auto-upload="false">
        <el-button type="primary" round class="el-icon-upload">点击上传图片</el-button>
      </el-upload>
    </div>
    <!-- 畸变处理之后 -->
    <div class="show-area">
    </div>
  </main>
  <!-- 重新上传图片 -->
  <div class="re-uploadImg">
    <el-upload action="" :show-file-list=false
      v-if="isShowUploadImg" :on-change="upload" :auto-upload="false">
      <el-button type="primary" round class="el-icon-upload" size="mini">重新上传图片</el-button>
    </el-upload>
  </div>
  <!-- 参数区域 -->
  <div class="input-data">
    <!-- 畸变参数 -->
    <div class="parameter-area1">
      <div class="data1">畸变参数 k1</div>
      <el-slider class="value1" show-input input-size="mini"
        v-model="parameter1" @change="changeParameter()"></el-slider>
      <div class="data1">畸变参数 k2</div>
      <el-slider class="value1" show-input input-size="mini"
        v-model="parameter2" @change="changeParameter()"></el-slider>
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
      isShowUploadImg: false,
      // 文件路径
      filePath: '',
      // 本地文件路径
      localPath: ''
    }
  },
  methods: {
    upload (file) {
      this.localPath = file.raw.path
      // ipcRenderer.send('on-upload-img', file.raw.path)
      this.isShowUploadImg = true
      let url = URL.createObjectURL(file.raw)
      this.filePath = url
      this.changeParameter()
    },
    changeParameter () {
      ipcRenderer.send('transImgData', {
        filepath: this.localPath,
        K1: this.parameter1,
        K2: this.parameter2
      })
    }
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
</style>


