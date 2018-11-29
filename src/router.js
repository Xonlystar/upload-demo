import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/upload'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "about" */ './views/login.vue')
    },
    {
      path: '/neditor',
      name: 'neditor',
      component: () => import(/* webpackChunkName: "about" */ './views/neditor.vue')
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import(/* webpackChunkName: "about" */ './views/upload.vue')
    },
    {
      path: '/selfUpload',
      name: 'selfUpload',
      component: () => import(/* webpackChunkName: "about" */ './views/selfUpload.vue')
    },
    {
      path: '/wangeditor',
      name: 'wangeditor',
      component: () => import(/* webpackChunkName: "about" */ './views/wangeditor.vue')
    }
  ]
})
