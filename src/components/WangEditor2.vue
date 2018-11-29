<template>
  <div class="editor-wrapper">
    <div :id="editorId" class="editor"></div>
  </div>
</template>

<script>
import Editor from 'wangeditor'
import 'wangeditor/release/wangEditor.min.css'
import plupload from 'plupload'
import { randomString, getSuffix } from '@/untils/until'
import { getUploadToken } from '@/untils/uploadToken'

export default {
  name: 'Editor',
  props: {
    // 绑定值
    value: {
      type: String,
      default: ''
    },
    size: { // 图片的尺寸
      type: String,
      default: '500kb'
    },
    // 菜单栏id
    toolbarId: {
      type: String,
      default: ''
    },
    // 绑定的值的类型, enum: ['html', 'text']
    valueType: {
      type: String,
      default: 'html'
    },
    // 设置change事件触发时间间隔
    changeInterval: {
      type: Number,
      default: 200
    },
    // 设置placehoder
    placeholder: {
      type: String,
      default: '从这里开始写作'
    },
    // 是否开启本地存储
    cache: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    editorId () {
      return `editor${this._uid}`
    }
  },
  data () {
    return {
      postUrl: '', // 上传地址
      editor: ''
    }
  },
  mounted () {
    // 配置编辑器
    this.initEditor()
    // create这个方法一定要在所有配置项之后调用
    this.editor.create()
    // 如果本地有存储加载本地存储内容
    let html = this.value || localStorage.editorCache
    if (html) this.editor.txt.html(html)
    // 监听图片上传事件
    this.initUpload(this.editor.imgMenuId)
  },
  methods: {
    setHtml (val) {
      this.editor.txt.html(val)
    },
    initEditor () {
      this.editor = this.toolbarId ? new Editor(`#${this.toolbarId}`, `#${this.editorId}`) : new Editor(`#${this.editorId}`)
      this.editor.customConfig.onchange = (html) => {
        let text = this.editor.txt.text()
        if (this.cache) localStorage.editorCache = html
        this.$emit('input', this.valueType === 'html' ? html : text)
        this.$emit('on-change', html, text)
      }
      this.editor.customConfig.onchangeTimeout = this.changeInterval
      // 上传的图片为base64
      // this.editor.customConfig.uploadImgShowBase64 = true
      // 上传图片的地址
      this.editor.customConfig.uploadImgServer = 'http://oss-cn-hangzhou.aliyuncs.com'
      this.editor.customConfig.menus = [
        'undo', // 撤销
        'redo', // 重复
        // 'fontSize', // 字号
        'quote', // 引用
        // 'fontName', // 字体
        // 'italic', // 斜体
        // 'head', // 标题
        // 'bold', // 粗体
        'underline', // 下划线
        'strikeThrough', // 删除线
        // 'foreColor', // 文字颜色
        // 'backColor', // 背景颜色
        'link', // 插入链接
        'list', // 列表
        'justify', // 对齐方式
        // 'emoticon', // 表情
        'image', // 插入图片
        'table', // 表格
        // 'video', // 插入视频
        'code' // 插入代码
      ]
      this.editor.customConfig.zIndex = 100
    },
    initUpload (id) {
      let self = this
      // 定义 plupload 对象
      const uploader = new plupload.Uploader({
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
              self.$message({
                message: '请上传小于500KB的图片',
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
      if (this.editor) {
        this.editor.cmd.do('insertHtml', '<img src="' + url + '" style="width:100%;margin: 10px 0"/>')
      }
      this.$emit('getUrl', {
        url: url
      })
    }
  }
}
</script>
