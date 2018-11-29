<template>
  <div class="upload">
    <button class="upload-btn primary-btn" :id="id" v-show="!hidden"></button>
  </div>
</template>
<script>

import plupload from 'plupload'
import { randomString, getSuffix } from '@/untils/until'
import { getUploadToken } from '@/untils/uploadToken'

/**
 * 压缩+上传图片混合
 */
export default {
  props: {
    id: String, // 图片id（每次调用的时候都是需要唯一的）
    width: {
      type: Number,
      default: 1920
    },
    height: {
      type: Number,
      default: 520
    },
    hidden: {
      type: Boolean,
      default: false
    },
    dir: { // 上传的文件夹
      type: String,
      default: ''
    }
  },
  components: {},
  mounted () {
    this.initPlupload(this.id)
  },
  data () {
    return {
      uploader: '', // 上传对象
      postUrl: '', // 上传地址
      size: '500kb'
    }
  },
  methods: {
    /**
     * 初始化oss直传插件
     * @param id 触发上传图片时间的元素id
     */
    initPlupload (id) {
      let self = this
      // 定义 plupload 对象
      this.uploader = new plupload.Uploader({
        multi_selection: false, // 禁止多文件上传
        browse_button: id, // 触发文件选择对话框的按钮，为那个元素id
        url: 'https://hd-up.oss-cn-hangzhou.aliyuncs.com/', // 服务器端的上传页面地址
        filters: {
          mime_types: [
            {
              title: 'Image files',
              extensions: 'jpg,png'
            }
          ],
          max_file_size: self.size, // 最大只能上传500kb的文件
          img_width_height: [self.width, self.height], // 图片尺寸判断
          prevent_duplicates: true // 不允许选取重复文件
        },
        // 启动resize png 会变大
        // resize: {
        //   width: self.width, // 压缩后宽
        //   height: self.height, // 压缩后高
        //   // crop: false, // 开启图片裁剪
        //   // quality: 55, // 裁剪质量
        //   // preserve_headers: false // 压缩后是否保留图片的元数据
        // },
        init: {
          PostInit () {},
          /*
          * 当文件添加到上传队列后
          */
          FilesAdded (up, files) {
            // console.log(up, files[0].name)
            // console.log('图片已加到上传队列中')
            getUploadToken(self.startUpload, up, files[0].name)
          },
          /**
           *  上传进度
           */
          UploadProgress (up, files) {
            // console.log('上传进度')
            // console.log(files)
          },
          /**
           *文件上传成功后
           */
          FileUploaded: function (up, file, info) {
            console.log('up', up)
            console.log('file', file)
            console.log('info', info)
            console.log(
              `图片原始大小：${(file.origSize / 1024).toFixed(2)}kb，压缩后大小：${(file.size / 1024).toFixed(2)}kb，压缩率：${(100 - file.size / file.origSize * 100).toFixed(2)}%`
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
              console.log('请上传小于500KB的图片')
            } else if (err.code === -601) {
              console.log('选择的文件类型不正确')
            } else if (err.code === -602) {
              console.log('已上传过该文件')
            } else {
              console.log(err)
            }
          }
        }
      })
      // 在实例对象上调用init()方法进行初始化
      this.uploader.init()
    },
    startUpload (ossInfo, up, filename) {
      console.log(this.dir)
      if (filename !== '') {
        // 对本地图片名进行随机重命名
        this.g_object_name = ossInfo.dir + this.dir + randomString(10) + getSuffix(filename)
      }
      let newMultipartParams = {
        key: this.g_object_name,
        ...ossInfo
      }
      this.postUrl = 'https://' + ossInfo.host.split('//')[1]
      console.log('newMultipartParams', newMultipartParams)
      up.setOption({
        url: 'https://' + ossInfo.host.split('//')[1],
        multipart_params: newMultipartParams
      })
      // 启动oss上传功能
      up.start()
    },
    getImgUrl (host, fileName) {
      let url = host + '/' + fileName
      this.$emit('getUrl', {
        url: url
      })
    }
  }
}
</script>
<style scoped>
.upload {
  display: inline-block;
  vertical-align: top;
}
.upload .primary-btn {
  display: inline-block;
  width: 160px;
  height: 160px;
  border: none;
  background: url(../assets/img_add.png);
  cursor: pointer;
}
</style>
