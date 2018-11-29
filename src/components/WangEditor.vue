<template>
  <div class="editor-wrapper">
    <div :id="editorId" class="editor"></div>
  </div>
</template>

<script>
import Editor from 'wangeditor'
import 'wangeditor/release/wangEditor.min.css'
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
      default: '2048'
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
  mounted () {
    // 配置编辑器
    this.initEditor()
    // create这个方法一定要在所有配置项之后调用
    this.editor.create()
    // 如果本地有存储加载本地存储内容
    let html = this.value || localStorage.editorCache
    if (html) this.editor.txt.html(html)
    // 监听图片上传事件
    // this.initUpload()
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
      this.editor.customConfig.uploadImgShowBase64 = true
      // 上传图片的地址
      // this.editor.customConfig.uploadImgServer = 'http://oss-cn-hangzhou.aliyuncs.com'
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
    /**
     * 初始化上传
     */
    initUpload () {
      this.initPlupload(this.editor.imgMenuId)
    }
  }
}
</script>
