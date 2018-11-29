<template>
  <section class="login-container">
    <div class="login-form-box">
      <div class="login-title"></div>
      <form action="" class="login-form">
        <div class="login-form-title"></div>
        <div class="login-input-item">
          <label for="username" class="login-icon people-icon"></label>
          <input type="text" id="username" autocomplete="off" v-model.trim="username" class="login-input" placeholder="请输入用户名">
        </div>
        <div class="login-input-item margin-top-20">
          <label for="password" class="login-icon lock-icon pos-relative"></label>
          <input type="password" id="password" v-model.trim="password" class="login-input" placeholder="请输入密码">
        </div>
        <div style="position: relative;" class="margin-top-20">
          <div class="login-input-item " style="width: 274px; display: inline-block;">
            <label for="verti" class="login-icon verti-icon pos-relative"></label>
            <input type="text" id="verti" autocomplete="off" v-model.trim="code" @keyup.enter="login" class="login-input" style="width: 190px;" placeholder="请输入验证码">
          </div>
          <img class="verti-img" alt="看不清?点击刷新" @click="changeImg"  :src="src" />
        </div>
        <div class="margin-top-30">
          <button class="login-btn" @click="login">登录</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import { storageSet } from '@/untils/storage.js'
export default {
  name: 'login',
  props: '',
  data () {
    return {
      // loginDisable: true,
      username: 'admin',
      password: '123456',
      src: '',
      code: '',
      verifystr: ''
    }
  },
  computed: {
    // 判断用户名、密码、验证码是否填写，填写了让按钮变为可点击
    loginDisable () {
      return !(this.username && this.password && this.code)
    }
  },
  methods: {
    changeImg () {
      this.verifystr = Math.random() + ''
      this.$Geting('/admin/admin-common/get-imgverify', { verifystr: this.verifystr }).then(res => {
        this.src = res.data.vertification_img
      }).catch(() => {})
    },
    login () {
      let param = {
        username: this.username,
        password: this.password,
        code: this.code,
        verifystr: this.verifystr
      }
      this.$Posting('/admin/admin-common/login', param).then(res => {
        if (res) {
          storageSet('userInfo', res.data)
          storageSet('username', this.username)
          console.log(res.msg)
          console.log('登录成功')
        }
      }).catch(() => {})
    }
  },
  created () {
    this.$nextTick(() => {
      this.changeImg()
    })
  }
}
</script>
