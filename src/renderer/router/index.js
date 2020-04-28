import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Distortion',
      component: () => import('@/components/Distortion.vue')
      // component: require('@/components/Distortion').default
    },
    {
      path: '/distortion',
      name: 'Distortion',
      component: () => import('@/components/Distortion.vue')
      // component: require('@/components/Distortion').default
    },
    {
      path: '/handleVideo',
      name: 'HandleVideo',
      component: () => import('@/components/HandleVideo.vue')
      // component: require('@/components/HandleVideo').default
    },
    // 重定向
    {
      path: '*',
      redirect: '/'
    }
  ]
})
