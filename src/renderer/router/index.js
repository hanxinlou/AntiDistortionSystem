import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/handleVideo',
      name: 'HandleVideo',
      component: require('@/components/HandleVideo').default
    },
    {
      path: '/',
      name: 'Distortion',
      component: require('@/components/Distortion').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
