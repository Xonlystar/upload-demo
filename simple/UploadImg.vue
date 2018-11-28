<template>
  <div class="upload">
    <button class="upload-btn primary-btn"  :id="id" :disabled="count === 5"></button>
  </div>
</template>
<script>
import saveUserTempInfo from '@/mixins/saveUserTempInfo'
import plupload from 'plupload'

/**
 * 压缩+上传图片混合
 * */
export default {
  mixins: [saveUserTempInfo],
  props: {
    id: String, // 图片id（每次调用的时候都是需要唯一的）
    count: { // 选中的图片
      type: Number,
      default: 0
    },
    size: { // 图片的尺寸
      type: String,
      default: '50'
    },
    keys: String // 当前项在form表单对应的key
  },
  components: {},
  mounted () {
    console.log('id', this.id)
    this.initPlupload(this.id)
  },
  data () {
    return {
      postUrl: '' // 上传地址
    }
  },
  methods: {
    /**
     * 初始化oss直传插件
     * @param {string} id 触发上传图片时间的元素id
     */
    initPlupload (id) {
      if (this.count === 5) {
        return
      }
      this.id = id
      // 定义 plupload 对象
      // const tokenInfo = this.storageGet('uploadTokenInfo')
      // 当前 json 信息
      let currentJson = {
        type: 1,
        id: 'upload',
        size: this.size + 'kb',
        imgSrc: '../../../static/image/exampleLogo.jpg'
      }
      let self = this
      // console.log(tokenInfo)
      const uploader = new plupload.Uploader({
        multi_selection: false, // 禁止多文件上传
        browse_button: id, // 触发文件选择对话框的按钮，为那个元素id
        url: 'http://oss-cn-hangzhou.aliyuncs.com', // 服务器端的上传页面地址
        filters: {
          mime_types: [
            // 只允许上传图片和zip文件
            {
              title: 'Image files',
              extensions: 'jpg,png'
            }
          ],
          max_file_size: currentJson.size, // 最大只能上传5mb的文件
          prevent_duplicates: false // 不允许选取重复文件
        },
        resize: {
          width: currentJson.width, // 压缩后宽
          height: currentJson.height, // 压缩后高
          crop: true, // 开启图片裁剪
          quality: 55, // 裁剪质量
          preserve_headers: false // 压缩后是否保留图片的元数据
        },
        init: {
          PostInit () {},
          /*
           * 当文件添加到上传队列后
           */
          FilesAdded (up, files) {
            self.getUploadToken(up, files[0].name)
          },
          /**
           *  上传进度
           */
          UploadProgress (up, files) {
          },
          /**
           *文件上传成功后
           */
          FileUploaded: function (up, file, info) {
            console.log('up', up)
            console.log('file', file)
            console.log('info', info)
            console.log(
              `图片原始大小：${(file.origSize / 1024).toFixed(
                2
              )}kb，压缩后大小：${(file.size / 1024).toFixed(2)}kb，压缩率：${(
                100 -
                file.size / file.origSize * 100
              ).toFixed(2)}%`
            )
            if (info.status === 200) {
              console.log('info:', info)
              self.getImgUrl(self.postUrl, self.g_object_name)
            } else if (info.status === 203) {
              console.log(
                '上传到OSS成功，但是oss访问用户设置的上传回调服务器失败，失败原因是:' +
                info.response
              )
            } else {
              console.log(info.response)
            }
          },
          /**
           * 错误信息
           */
          Error: function (up, err) {
            // console.log(err)
            if (err.code === -600) {
              self.$message({
                message: '图片大小不能超过' + currentJson.size,
                type: 'warning'
              })
            } else if (err.code === -601) {
              self.$message({
                message: '选择的文件类型不正确',
                type: 'warning'
              })
            } else if (err.code === -602) {
              self.$message({
                message: '已上传过该文件',
                type: 'warning'
              })
            } else {
              self.$message({
                message: err,
                type: 'warning'
              })
            }
          }
        }
      })

      // 在实例对象上调用init()方法进行初始化
      uploader.init()
    },
    /**
     * 随机码 对指定的字符串中随机取参数位
     */
    random_string (len) {
      len = len || 32
      let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      let maxPos = chars.length
      let pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    },
    /**
     * 获取后缀
     */
    get_suffix (filename) {
      let pos = filename.lastIndexOf('.')
      let suffix = ''
      if (pos !== -1) {
        suffix = filename.substring(pos)
      }
      return suffix
    },
    /** 获取oss图片上传 token （进入相关页面预先请求）
     * @returns {Promise.<T>}
     */
    getUploadToken (up, filename) {
      this.$Geting('/auth/getOssToken', {}).then(res => {
        if (res) {
          let ossInfo = res
          const expireTime = 1800 * 1000
          this.storageSet('uploadTokenInfo', res)
          this.storageSet('uploadTokenExpireTimeValid', expireTime) // 设置 token 过期时间
          this.storageSet(
            'uploadTokenExpireTime',
            new Date().getTime() + expireTime
          )// 设置 token 过期时间

          if (filename !== '') {
            // 对本地图片名进行随机重命名
            this.g_object_name =
              ossInfo.dir +
              this.random_string(10) +
              this.get_suffix(filename)
          }
          let newMultipartParams = {
            key: this.g_object_name,
            policy: ossInfo.policy,
            OSSAccessKeyId: ossInfo.accessId,
            success_action_status: '200', // 让服务端返回200,不然，默认会返回204
            signature: ossInfo.signature
          }
          this.postUrl = 'https://' + ossInfo.host.split('//')[1]
          console.log('newMultipartParams', newMultipartParams)
          up.setOption({
            url: 'https://' + ossInfo.host.split('//')[1],
            multipart_params: newMultipartParams
          })
          // 启动oss上传功能
          up.start()
        } else {
          // 当错误的时候，进行错误统一处理
          this.errorHandler(res)
        }
      })
        .catch(() => {})
    },

    getImgUrl (host, fileName) {
      let url = host + '/' + fileName
      this.$emit('getUrl', {
        url: url,
        keys: this.keys
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.upload {
  .primary-btn {
    display: block;
    width: 160px;
    height: 160px;
    border: none;
    background: url(../assets/images/img_add.png);
    cursor: pointer;
  }
}
</style>
