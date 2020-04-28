<template>
  <div id="indexpage"> 
    <main>
      <!-- 上传区域 -->
      <div class="upload-area">
        <video id="uploadVideo" controls="controls" 
          v-bind:src="filepath" v-if="isShowUploadVideo"></video>
        <el-upload action="" 
          v-if="!isShowUploadVideo" :on-change="upload" :auto-upload="false">
          <el-button type="primary" round class="el-icon-upload">点击上传文件</el-button>
        </el-upload>
      </div>
      <!-- 输出结果区域 -->
      <div class="show-area">
      </div>
    </main>
    <!-- 确认采样 -->
    <div class="sampling" v-if="isShowUploadVideo">
      <div class="data1">视频进度条</div>
      <el-slider class="value2"
        v-model="videoInfo.precent" @change="handleTimeUpdate"></el-slider>
      <el-button class="checkbtn" type="primary" round size="mini"
        @click="checkSample()">确认采样</el-button>
    </div>
    <!-- 参数区域 -->
    <div class="input-data">
      <!-- 预设按钮 -->
      <div class="pre">
        <el-button type="primary" round class="el-icon-folder" size="mini" 
          @click="saveDialogVisible = true">保存预设</el-button>
        <el-button type="primary" round class="el-icon-folder-opened" size="mini" 
          @click="importDialogVisible = true">导入预设</el-button>
      </div>
      <!-- 畸变参数 -->
      <div class="parameter-area1">
        <div class="data1">畸变参数 k1</div>
        <el-slider class="value1" show-input input-size="mini"
          v-model="currentData.parameter1"></el-slider>
        <div class="data1">畸变参数 k2</div>
        <el-slider class="value1" show-input input-size="mini"
          v-model="currentData.parameter2"></el-slider>
      </div>
      <!-- 畸变中心坐标 -->
      <div class="parameter-area1">
        <div class="data1">畸变中心坐标X</div>
        <el-slider class="value1" show-input input-size="mini"
          v-model="currentData.valueX"></el-slider>
        <div class="data1">畸变中心坐标Y</div>
        <el-slider class="value1" show-input input-size="mini"
          v-model="currentData.valueY"></el-slider>
      </div>
      <!-- 遗传变异交叉概率 -->
      <div class="parameter-area1">
        <div class="data1">遗传的变异概率</div>
        <el-slider class="value1" show-input input-size="mini"
          v-model="currentData.probability1"></el-slider>
        <div class="data1">遗传的交叉概率</div>
        <el-slider class="value1" show-input input-size="mini"
          v-model="currentData.probability2"></el-slider>
      </div>
      <!-- 模拟退火算法优化 -->
      <div class="is-population-area">
        <div class="data2">是否利用模拟退火算法来优化种群选择</div>
        <el-switch class="is-population-data" 
          active-color="#409eff" inactive-color="#dcdfe6"
          v-model="currentData.isPopulation"></el-switch>
      </div>
      <!-- 退火算法参数调整 -->
      <div v-if="currentData.isPopulation" >
        <div class="parameter-area2">
          <div class="data1">初始温度</div>
          <el-slider class="value2" show-input input-size="mini"
            v-model="currentData.startTemperature"></el-slider>
        </div>
        <div class="parameter-area2">
          <div class="data1">终止温度</div>
          <el-slider class="value2" show-input input-size="mini"
            v-model="currentData.endTemperature"></el-slider>
        </div>
        <div class="parameter-area2">
          <div class="data1">降温速度</div>
          <el-slider class="value2" show-input input-size="mini"
            v-model="currentData.coolingRate"></el-slider>
        </div>
      </div>
    </div>
    <!-- 开始停止按钮 -->
    <div class="button-area">
      <el-button type="primary" round class="el-icon-video-play">开始</el-button>
      <el-button type="primary" round class="el-icon-video-pause">停止</el-button>
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
  import {ipcRenderer} from 'electron'
  export default {
    name: 'index-page',
    data () {
      return {
        // 当前参数
        currentData: {
          parameter1: 0,
          parameter2: 0,
          valueX: 0,
          valueY: 0,
          probability1: 0,
          probability2: 0,
          isPopulation: false,
          startTemperature: 0,
          endTemperature: 0,
          coolingRate: 0
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
        filepath: '',
        // 当前视频数据
        videoInfo: {
          duration: 0,
          currentTime: 0,
          precent: 0
        },
        // 采样时间点百分比
        sampleTimePoint: 0
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
      loadpreList () {
        let myStorage = window.localStorage
        let getList = JSON.parse(myStorage.getItem('preList'))
        console.log('getlist')
        console.log(getList)
        this.preList = getList
        if (myStorage.getItem('count') != null) {
          this.count = myStorage.getItem('count')
        }
      },
      // 保存预设函数
      saveData () {
        let myStorage = window.localStorage
        console.log('myStorage')
        console.log(myStorage)
        console.log('this.currentData')
        console.log(this.currentData)
        this.preIndex = this.count
        this.preList.push({value: this.preIndex, label: this.preName, predata: this.currentData})
        let preListToJson = JSON.stringify(this.preList)
        console.log('preListToJson')
        console.log(preListToJson)
        myStorage.setItem('preList', preListToJson)
        this.saveDialogVisible = false
        this.count++
        myStorage.setItem('count', this.count)
      },
      // 导入预设函数
      importData () {
        let myStorage = window.localStorage
        console.log(myStorage.getItem('preList'))
        let getData = JSON.parse(myStorage.getItem('preList'))
        console.log('getdata')
        console.log(getData)
        this.preList = getData
        console.log('this.preList')
        console.log(this.preList)
        console.log(this.value)
        for (let index = 0; index < getData.length; index++) {
          if (getData[index].value === this.value) {
            for (let key in this.currentData) {
              this.currentData[key] = getData[index].predata[key]
            }
          }
        }
        this.importDialogVisible = false
      },
      upload (file) {
        ipcRenderer.send('on-upload-video', file.raw.path)
        this.isShowUploadVideo = true
        let url = URL.createObjectURL(file.raw)
        this.filepath = url
        console.log('uploadsuccess')
        console.log('handleVideoInfo')

        let t = setInterval(() => {
          let uploadVideo = document.getElementById('uploadVideo')
          if (uploadVideo != null) {
            console.log(uploadVideo)
            console.log(uploadVideo.duration)
            this.videoInfo.currentTime = uploadVideo.currentTime
            this.videoInfo.duration = uploadVideo.duration
            clearInterval(t)
          }
        }, 500)
      },
      // 处理确认采样进度条
      // handleVideoInfo () {
      // },
      // 处理确认采样进度条变化与视频进度条统一
      handleTimeUpdate () {
        console.log('handleTimeUpdate')
        let uploadVideo = document.getElementById('uploadVideo')
        uploadVideo.currentTime = this.videoInfo.precent * uploadVideo.duration / 100
      },
      checkSample () {
        this.sampleTimePoint = this.videoInfo.precent / 100
        console.log(this.sampleTimePoint)
      }
    },
    created () {
      this.loadpreList()
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

  #indexpage {
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
  video {
    width: 100%;
    height: 100%
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

  .is-population-area{
    margin: 20px 30px;
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
  }
  
</style>
