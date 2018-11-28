
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
  if (uploadTokenExpireTime && nowTime < uploadTokenExpireTime) {
    var ossInfo = storageGet('uploadTokenInfo')
    return cb(ossInfo, ...param)
  } else {
    Vue.Posting('/admin/user/get-osstoken', { dir: 'owadmin/' }).then(res => {
      if (res) {
        let ossInfo = {
          OSSAccessKeyId: res.data.accessid,
          host: res.data.host,
          dir: res.data.dir,
          policy: res.data.policy,
          signature: res.data.signature,
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
  }
}
