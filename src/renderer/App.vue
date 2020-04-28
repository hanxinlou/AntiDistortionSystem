<template>
  <div id="app">
    <div class="menu-container">
        <Menu />
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import Menu from '@/components/Menu.vue'
export default {
  name: 'anti-distortion',
  components: { Menu }
}
</script>

<style>
head{
  font-size: 100px;
}
  /* CSS */
</style>
