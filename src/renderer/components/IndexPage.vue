<template>
  <div id="indexpage"> 
    <main>
      <div class="upload-area">
        <el-button type="primary" round class="el-icon-upload" >点击上传文件</el-button>
      </div>
      <div class="show-area">
      </div>
    </main>
    <div class="input-data">
      <div class="pre">
        <el-button type="primary" round class="el-icon-folder" size="mini" @click="saveDialogVisible = true">保存预设</el-button>
        <el-button type="primary" round class="el-icon-folder-opened" size="mini" @click="importDialogVisible = true">导入预设</el-button>
      </div>
      <div class="parameter-area1">
        <div class="data1">畸变参数 k1</div>
        <el-slider class="value1" v-model="parameter1" show-input input-size="mini"></el-slider>
        <div class="data1">畸变参数 k2</div>
        <el-slider class="value1" v-model="parameter2" show-input input-size="mini"></el-slider>
      </div>
      <div class="parameter-area1">
        <div class="data1">畸变中心坐标X</div>
        <el-slider class="value1" v-model="valueX" show-input input-size="mini"></el-slider>
        <div class="data1">畸变中心坐标Y</div>
        <el-slider class="value1" v-model="valueY" show-input input-size="mini"></el-slider>
      </div>
      <div class="parameter-area1">
        <div class="data1">遗传的变异概率</div>
        <el-slider class="value1" v-model="probability1" show-input input-size="mini"></el-slider>
        <div class="data1">遗传的交叉概率</div>
        <el-slider class="value1" v-model="probability2" show-input input-size="mini"></el-slider>
      </div>
      <div class="is-population-area">
        <div class="data2">是否利用模拟退火算法来优化种群选择</div>
        <el-switch class="is-population-data" v-model="isPopulation" active-color="#409eff" inactive-color="#dcdfe6"></el-switch>
      </div>
      <div v-if="isPopulation" >
        <div class="parameter-area2">
          <div class="data1">初始温度</div>
          <el-slider class="value2" v-model="startTemperature" show-input input-size="mini"></el-slider>
        </div>
        <div class="parameter-area2">
          <div class="data1">终止温度</div>
          <el-slider class="value2" v-model="endTemperature" show-input input-size="mini"></el-slider>
        </div>
        <div class="parameter-area2">
          <div class="data1">降温速度</div>
          <el-slider class="value2" v-model="coolingRate" show-input input-size="mini"></el-slider>
        </div>
      </div>
    </div>
    <div class="button-area">
      <el-button type="primary" round class="el-icon-video-play">开始</el-button>
      <el-button type="primary" round class="el-icon-video-pause">停止</el-button>
    </div>
    <el-dialog title="保存预设" :visible.sync="saveDialogVisible" width="30%" :before-close="handleClose">
      <el-input v-model="preinput" placeholder="请输入预设名称"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="导入预设" :visible.sync="importDialogVisible" width="30%" :before-close="handleClose">
       <el-select v-model="value" placeholder="请选择">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
    </el-option>
  </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'index-page',
    data () {
      return {
        parameter1: 0,
        parameter2: 0,
        valueX: 0,
        valueY: 0,
        probability1: 0,
        probability2: 0,
        isOperator: false,
        isPopulation: false,
        preinput: '',
        saveDialogVisible: false,
        importDialogVisible: false,
        options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
        value: ''
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

  #indexpage {
    background: white;
    height: 100vh;
    /* padding: 60px 80px; */
    width: 100vw;
  }

  main{
    margin: 20px;
    height: 40vh;
    display: flex;
    justify-content: center;
  }

  .upload-area{
    width: 48%;
    height: 40vh;
    line-height: 40vh;
    text-align: center;
    border: 5px dashed transparent;
    background: linear-gradient(white,white) padding-box,
    repeating-linear-gradient(-45deg,#409eff 0, #409eff 0.25em,white 0,white 0.75em);
  }

  .show-area{
    width: 47%;
    height: 40vh;
    line-height: 50vh;
    text-align: center;
    border: 5px dashed transparent;
    border-left-width: 0;
    background: linear-gradient(white,white) padding-box,
    repeating-linear-gradient(-45deg,#409eff 0, #409eff 0.25em,white 0,white 0.75em);
  }

  .pre{
    margin:10px 45px;
    display: flex;
    justify-content: flex-end;
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
