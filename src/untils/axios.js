import Vue from 'vue'
import axios from 'axios'
import { storageGet } from './storage'

const axiosX = axios.create({
  baseURL: process.env.API,
  timeout: 80000
})
/**
 * 判断请求是否成功，如果失败则给出对应提示
 * @param response 请求数据
 */
function checkStatus (response) {
  // 如果http状态码正常，则直接返回数据
  if (response && (Number(response.status) === 200 || Number(response.status) === 304)) {
    return response.data
  }
}

/**
 * 当请求成功，但是出现了业务层面错误时候，给出对应的错误处理
 * @param res 返回的信息
 */
function codeErrorHandle (msg) {
  console.log(msg)
}

axiosX.interceptors.request.use(function (config) {
  config.headers['Content-Type'] = 'application/json; charset=UTF-8'
  // 在发送请求之前做些什么
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

axiosX.interceptors.response.use(function (response) {
  let res = checkStatus(response)
  if (res) {
    if (res.code === 200) {
      return res
    } else if (res.code === 201) {
      // 请求成功，但是业务逻辑出错情况下，给出对应提示
      codeErrorHandle(res.msg)
      return Promise.reject(res)
    } else if (res.code === 202) {
      // session 过期
      codeErrorHandle(res.msg)
      window.sessionStorage.clear()
      setTimeout(function () {
        window.location = '/login'
      }, 1000)
      return Promise.reject(res)
    }
  }
}, function (err) {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '错误请求'
        break
      case 401:
        err.message = '未授权，请重新登录'
        break
      case 403:
        err.message = '拒绝访问'
        break
      case 404:
        err.message = '请求错误,未找到该资源'
        break
      case 405:
        err.message = '请求方法未允许'
        break
      case 408:
        err.message = '请求超时'
        break
      case 500:
        err.message = '服务器端出错'
        break
      case 501:
        err.message = '网络未实现'
        break
      case 502:
        err.message = '网络错误'
        break
      case 503:
        err.message = '服务不可用'
        break
      case 504:
        err.message = '网络超时'
        break
      case 505:
        err.message = 'http版本不支持该请求'
        break
      default:
        err.message = `连接错误${err.response.status}`
    }
  } else {
    err.message = '登录超时，请重新登录'
    window.sessionStorage.clear()
    setTimeout(function () {
      window.location.reload()
    }, 1000)
  }
  console.log(err.message)
  return Promise.reject(err)
})

const XHR = ({
  method = 'post',
  qs = true,
  loading = false,
  loginRequire = true,
  reqComplex = false,
  reqContentType = 'urlencoded'
}) => {
  // 用户登陆信息
  const userInfo = storageGet('userInfo')
  let user = null
  if (userInfo) {
    user = {
      access_token: userInfo.access_token
    }
  }

  // 带请求进度条成功方法
  const sucFunX = res => {
    return res
  }

  // 成功执行方法
  const sucFunC = res => {
    return res
  }

  // 带请求进度条失败方法
  const errFunX = err => {
    return Promise.reject(err)
  }
  // 失败执行访求
  const errFunC = err => {
    return Promise.reject(err)
  }

  // 判断是否需要Longing
  const sucFun = loading ? sucFunX : sucFunC

  // 判断是否需要Longing
  const errFun = loading ? errFunX : errFunC

  return { user, sucFun, errFun }
}

// 简单带请求带状态POST
// Posting('/fsddf', {id: 111, page: 1})
const Posting = function (url = '', data = {}) {
  let { user, sucFun, errFun } = XHR({ loading: true })
  // let reqData = qs.stringify({ ...user, ...data })
  let reqData = { ...user, ...data }
  return axiosX.post(url, reqData).then(sucFun).catch(errFun)
}

// 简单带请求POST
// Post('/fsddf', {id: 111, page: 1})
const Post = function (url = '', data = {}) {
  let { user, sucFun, errFun } = XHR({ loading: false })
  // let reqData = qs.stringify({ ...user, ...data })
  let reqData = { ...user, ...data }
  return axiosX.post(url, reqData).then(sucFun).catch(errFun)
}

// 简单带请求带状态Get
// Geting('/fsddf', {id: 111, page: 1})
const Geting = function (url = '', data = {}) {
  let { user, sucFun, errFun } = XHR({ loading: true })
  let params = {
    params: { ...user, ...data }
  }
  return axiosX.get(url, params).then(sucFun).catch(errFun)
}

// 简单带请求GET
// Get('/fsddf', {id: 111, page: 1})
const Get = function (url = '', data = {}) {
  let { user, sucFun, errFun } = XHR({ loading: false })
  let params = {
    params: { ...user, ...data }
  }
  return axiosX.get(url, params).then(sucFun).catch(errFun)
}

//  默认请求
Vue.prototype.$axios = axios
Vue.axios = axios

// 带等待状态POST请求
Vue.prototype.$Posting = Posting
Vue.Posting = Posting

// 带等待状态GET请求
Vue.prototype.$Geting = Geting
Vue.Geting = Geting

// 无等待状态POST请求
Vue.prototype.$Post = Post
Vue.Post = Post

// 无等待状态GET请求
Vue.prototype.$Get = Get
Vue.Get = Get

export { axios, Posting, Geting, Post, Get }
