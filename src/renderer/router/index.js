import Vue from 'vue'
import Router from 'vue-router'
/**
 * 修改 vue-router 的push方法
 * 参考 https://blog.csdn.net/LonewoIf/article/details/103862282
 */
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Distortion',
      // component: () => import('@/components/Distortion.vue')
      component: require('@/components/Distortion').default
    },
    {
      path: '/distortion',
      name: 'Distortion',
      // component: () => import('@/components/Distortion.vue')
      component: require('@/components/Distortion').default
    },
    {
      path: '/handleVideo',
      name: 'HandleVideo',
      // component: () => import('@/components/HandleVideo.vue')
      component: require('@/components/HandleVideo').default
    },
    // 重定向
    {
      path: '*',
      redirect: '/'
    }
  ]
})
