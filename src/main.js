import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { Posting } from './untils/axios.js'
import { storageSet } from '@/untils/storage.js'

// 模拟登录
Posting('/admin/login', {
  adminName: 'admin',
  password: 'e10adc3949ba59abbe56e057f20f883e',
  checkCode: '9999'
}).then(res => {
  if (res) {
    storageSet('userInfo', res.adminMenuList)
    storageSet('username', res.adminName)
    console.log(res.errorMsg)
  }
}).catch(() => {})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
