import plupload from 'plupload'
import React from 'react'
import store from '~store/index'
import { Button, message} from 'antd'
import { getPictureOSSMessage }from '~store/modules/user/actions.js'

class Plupload extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            postUrl: '', // 上传地址
            id: 'update',
            g_object_name: ''
        }
    }

    componentDidMount(){
        this.initPlupload()
    }
     /**
     * 初始化oss直传插件
     * @param {string} id 触发上传图片时间的元素id
     */
    initPlupload () {
        
        // this.id = id
        // 定义 plupload 对象
        // const tokenInfo = this.storageGet('uploadTokenInfo')
        // 当前 图片基础熟悉设置
        let currentJson = {
          type: 1,
          id: this.state.id,
          size: 5 + 'mb',
        }
        let self = this
        // console.log(tokenInfo)
        const uploader = new plupload.Uploader({
          multi_selection: false, // 禁止多文件上传
          browse_button: currentJson.id, // 触发文件选择对话框的按钮，为那个元素id
          url: 'http://fubeipay.oss-cn-qingdao.aliyuncs.com', // 服务器端的上传页面地址
          filters: {
            mime_types: [
              // 只允许上传图片和zip文件
              {
                title: 'Image files',
                extensions: 'jpg,png,bmp,jpeg' // 允许上传的文件类型
              }
            ],
            max_file_size: currentJson.size, // 最大只能上传5mb的文件
            prevent_duplicates: false // 不允许选取重复文件
          },
          resize: {
            width: 500, // 压缩后宽
            height: 500, // 压缩后高
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
                message.success('上传成功！')
                self.getImgUrl(self.state.postUrl, self.state.g_object_name)
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
              console.log(up, err)
              // console.log(err)
              if (err.code === -600) {
                // self.$message({
                //   message: '图片大小不能超过' + currentJson.size,
                //   type: 'warning'
                // })
                message.warning('图片大小不能超过' + currentJson.size)
              } else if (err.code === -601) {
                // self.$message({
                //   message: '选择的文件类型不正确',
                //   type: 'warning'
                // })
                message.warning('选择的文件类型不正确')
              } else if (err.code === -602) {
                // self.$message({
                //   message: '已上传过该文件',
                //   type: 'warning'
                // })
                message.warning('已上传过该文件')
              } else {
                // self.$message({
                //   message: err,
                //   type: 'warning'
                // })
                message.warning(err)
              }
            }
          }
        })
  
        // 在实例对象上调用init()方法进行初始化
        uploader.init()
      }
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
      }
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
      }
      /** 获取oss图片上传 token （进入相关页面预先请求）
       * @returns {Promise.<T>}
       */
      getUploadToken (up, filename) {
        store.dispatch(
              getPictureOSSMessage()
        ).then(res => {
            console.log(res) 
          if (res) {
            let ossInfo = JSON.parse(res.data.upImageToken)
            const expireTime = 1800 * 1000
            localStorage.setItem('uploadTokenInfo', ossInfo)
            localStorage.setItem('uploadTokenExpireTimeValid', expireTime) // 设置 token 过期时间
            localStorage.setItem('uploadTokenExpireTime', new Date().getTime() + expireTime)
            // 设置 token 过期时间
            // console.log(filename)
            if (filename !== '') {
              // 对本地图片名进行随机重命名
              this.setState({
                    g_object_name : ossInfo.dir + this.random_string(10) + this.get_suffix(filename)
              })
            }
            let newMultipartParams = {
              key: this.state.g_object_name,
              dir: ossInfo.dir,
              policy: ossInfo.policy,
              OSSAccessKeyId: ossInfo.accessid,
              success_action_status: '200', // 让服务端返回200,不然，默认会返回204
              signature: ossInfo.signature
            }
            this.setState({
                postUrl : 'http://' + ossInfo.host.split('//')[1]
            })
            console.log('newMultipartParams', newMultipartParams)
            up.setOption({
              url: 'http://' + ossInfo.host.split('//')[1],
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
      }
  
      getImgUrl (host, fileName) {
        let url = host + '/' + fileName
        console.log(url)
        this.props.callback(url); // 子组件传给父组件
      }
    render() {
        return (
            <div>
              <Button id={this.state.id} >更换头像</Button>
            </div>
        )
    }
}
export default Plupload