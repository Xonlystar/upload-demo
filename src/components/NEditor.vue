<template>
  <div class="editor-contain" :id="randomId" name="content" type="text/plain"></div>
</template>

<script>
import { randomString, getSuffix } from '@/untils/until'
import { getUploadToken } from '@/untils/uploadToken'

export default {
  name: 'VueUEditor',
  props: {
    neditorPath: {
      // Neditor 代码的路径
      type: String,
      default: '../../public/neditor/'
    },
    neditorConfig: {
      // Neditor 配置项
      type: Object,
      default: function () {
        return {
          serverUrl: 'https://hd-up.oss-cn-hangzhou.aliyuncs.com/'
        }
      }
    }
  },
  data () {
    return {
      // 为了避免麻烦，每个编辑器实例都用不同的 id
      randomId: 'editor_' + (Math.random() * 100000000000000000),
      instance: null
    }
  },
  created () {
    // 初始化图片上传方法
    this.initUploader()
    this.initEditor()
  },
  beforeDestroy () {
    // 组件销毁的时候，要销毁 Neditor 实例
    if (this.instance !== null && this.instance.destroy) {
      this.instance.destroy()
    }
  },
  methods: {
    initEditor () {
      if (this.instance === null) {
        // Vue 异步执行 DOM 更新，这样一来代码执行到这里的时候可能 template 里面的 script 标签还没真正创建
        // 所以，我们只能在 nextTick 里面初始化 Neditor
        this.$nextTick(() => {
          if (window.UE) {
            this.instance = window.UE.getEditor(this.randomId, this.neditorConfig)
            // 绑定事件，当 Neditor 初始化完成后，将编辑器实例通过自定义的 ready 事件交出去
            this.instance.addListener('ready', () => {
              this.$emit('ready', this.instance)
            })
          }
        })
      }
    },
    initUploader () {
      // 富文本编辑器图片上传
      window.UEDITOR_CONFIG['imageUploadService'] = function (context, uploader) {
        return {
          /**
           * 触发fileQueued事件时执行
           * 当文件被加入队列以后触发，用来设置上传相关的数据 (比如: url和自定义参数)
           * @param {Object} file 当前选择的文件对象
           */
          setUploadData: function (file) {
            // 这里添加token
            getUploadToken(function (ossInfo) {
              file.ossInfo = ossInfo
              return file
            }, file)
          },
          /**
           * 触发uploadBeforeSend事件时执行
           * 在文件上传之前触发，用来添加附带参数
           * @param {Object} object 当前上传对象
           * @param {Object} data 默认的上传参数，可以扩展此对象来控制上传参数
           * @param {Object} headers 可以扩展此对象来控制上传头部
           * @returns 上传参数对象
           */
          setFormData: function (object, data, headers) {
            let ossInfo = object.file.ossInfo
            console.log(ossInfo)
            let key = ossInfo.dir + '' + randomString(10) + getSuffix(data.name)
            data.key = key
            data.policy = ossInfo.policy
            data.OSSAccessKeyId = ossInfo.OSSAccessKeyId
            data.success_action_status = 200
            data.signature = ossInfo.signature
            let imageList = context.imageList || []
            imageList.push({
              url: ossInfo.host + '/' + key
            })
            return data
          },
          /**
           * 触发startUpload事件时执行
           * 当开始上传流程时触发，用来设置Uploader配置项
           * @param {Object} uploader
           * @returns uploader
           */
          setUploaderOptions: function (uploader) {
            return uploader
          },
          /**
           * 触发uploadSuccess事件时执行
           * 当文件上传成功时触发
           * @param {Object} res 上传接口返回的response
           * @returns {Boolean} 上传接口返回的response成功状态条件 (比如: res.code == 200)
           */
          getResponseSuccess: function (res) {
            // console.log(context)
            return true
          },
          /* 指定上传接口返回的response中图片路径的字段，默认为 url */
          imageSrcField: 'url'
        }
      }
    }
  }
}
</script>
