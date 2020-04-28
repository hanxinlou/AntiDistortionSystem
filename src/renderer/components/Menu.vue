<template>
  <div class="menu">
    <el-menu
      default-active="2"
      class="el-menu-demo"
      mode="horizontal"
      :style="{
        borderRight: 'none'
      }"
    >
      <template v-for="(menuItem, index) in menuList">
        <el-submenu
          v-if="menuItem.children && menuItem.children.length"
          :index="`${index}`"
          :key="index"
        >
          <template slot="title">
            <i :class="menuItem.icon"></i>
            <span>{{ menuItem.title }}</span>
          </template>

          <el-menu-item
            v-for="(childMenuItem, index2) in menuItem.children"
            :key="`${index}-${index2}`"
            :index="`${index}-${index2}`"
            style="min-width:0px;"
            @click="gotoPath(childMenuItem.path)"
            >{{ childMenuItem.title }}</el-menu-item
          >
        </el-submenu>

        <el-menu-item
          v-else
          :index="`${index}`"
          :key="index"
          style="min-width:0px;"
          @click="gotoPath(menuItem.path)"
        >
          <i :class="menuItem.icon"></i>
          <span>{{ menuItem.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { menuList } from '@/common/constant'

export default {
  name: 'Menu',
  data () {
    return {
      menuList
    }
  },
  methods: {
    gotoPath (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style lang="less" scoped>
.meun {
}
</style>
