
/**
 * 获取oss图片上传 token （进入相关页面预先请求）
 * @returns {Promise.<T>}
 */
import Vue from 'vue'
import { storageSet, storageGet } from './storage'

const expireTime = 3000 * 1000
export const getUploadToken = function (cb, ...param) {
  let nowTime = new Date().getTime()
  let uploadTokenExpireTime = storageGet('uploadTokenExpireTime')
  // if (uploadTokenExpireTime && nowTime < uploadTokenExpireTime) {
  //   var ossInfo = storageGet('uploadTokenInfo')
  //   return cb(ossInfo, ...param)
  // } else {
  Vue.Get('/oss/token', {}).then(res => {
    console.log(res)
    if (res) {
      let ossInfo = {
        OSSAccessKeyId: res.accessId,
        host: res.host,
        dir: res.dir,
        policy: res.policy,
        signature: res.signature,
        success_action_status: '200' // 让服务端返回200,不然，默认会返回204
      }
      storageSet('uploadTokenExpireTime', new Date().getTime() + expireTime) // 设置 token 过期时间
      storageSet('uploadTokenInfo', ossInfo)
      return cb(ossInfo, ...param)
    } else {
      // 当错误的时候，进行错误统一处理
      console.log(res)
    }
  }).catch(() => {})
  // }
}
