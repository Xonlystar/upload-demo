<template>
  <x-content v-scroll-record topShow :isBanDownSilder="false" title="注册" >

    <div class="card-big-box">
      <!--身份证 提示信息 Start-->
      <p class="card-title">请确保是您本人的真实身份证，否则会导致审核失败</p>
      <!--上传正面照的盒子  start-->

      <div class="card-box">
        <div class="positive-box" @click="wxUploadImg(1)">
          <span class="getPhoto"></span>
          <p>拍照上传正面身份证</p>
          <img class="upload-img" :src="identityFront" alt="">
        </div>
        <div class="side-box" @click="wxUploadImg(2)">
          <span class="getPhoto"></span>
          <p>拍照上传反面身份证</p>
          <img class="upload-img" :src="identityTail" alt="">
        </div>
        <span v-if="!showIdCard" class="positive-title">正面身份证</span>
        <span v-if="!showIdCard" class="side-title">反面身份证</span>
        <!--v-if="showIdCard"-->
        <div class="id-card-port" v-if="showIdCard">
          <div class="id-card-content">
            <i></i>
            <div class="id-card-box">
              <div class="id-card-name">姓名:<input type="text" ref="userName" v-model="user_name" class="card-name"></div>
              <div class="id-card-number">身份证号码: <input type="text" ref="cardNum" v-model="card_num" class="card-num"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="hand-box-parent">
        <div class="hand-box" @click="wxUploadImg(3)">
          <span class="getPhoto"></span>
          <img class="upload-img" :src="identityHand" alt="">
        </div>
        <span class="hand-title">手持身份证正面照</span>
      </div>

      <!--申请说明 end-->
      <mt-button @click="registerAction" class="margin-auto login-button" size="large" type="primary"
                 :class="isDis?'login-button-Jump':''" >
        {{btnTitleText}}
      </mt-button>
      <div @click="registerReturnAction" class="register-return margin-top-10">返回上一步</div>
      <!--<mt-button class="margin-auto margin-top-10 login-button" size="large" type="primary" v-if="examineShow" :disabled="!isDis">-->
        <!--正在审核中-->
      <!--</mt-button>-->
    </div>
    <div class="loading-bg"  v-if="loadingShow">
      <mt-spinner type="fading-circle" color="#02a8f5" :size="40" class="loading-style"></mt-spinner>
    </div>

  </x-content>
</template>

<script>
  import  Picker  from 'mint-ui/lib/picker';
  import ErrorHandler from 'src/mixins/errorHandler';
  import http from 'src/utils/http';
  import {mapGetters, mapActions} from 'vuex'
  import {Toast} from 'mint-ui';
  import Spinner from 'mint-ui/lib/spinner';

  export default {
    mixins: [ErrorHandler],
    components: {
      MtPicker: Picker,
      Toast,
      MtSpinner: Spinner,
    },
    data(){
      return {
        btnTitleText:'申请注册',
        examineShow: false,  //正在审核中按钮
        loadingShow: false,  //loading动画
//        isDis:false, // 按钮是否可点击
        isShow: false, // 是否显示省市区选择区域

//        appId:'',//微信配置 众号的唯一标识
//        timestamp:'',//微信配置 生成签名的时间戳
//        signature:'',//微信配置 生成签名的随机串
//        nonceStr:'',//微信配置 签名

        user_name:'',   //身份证姓名
        card_num:'',    //身份证号码
//        idCardName:'',   //身份证号
//        idCardNum:'',//身份证号码
        account_name:'',//身份证姓名
        password:'',//  密码
        contact_person:'',//
        phone:'',// 电话
        qq_number:'',// qq号码
        province_code:'',// 省
        city_code:'',//市
        area_code:'',//区
        urlHref:'',
        showIdCard:false,//是否显示身份证

        identityFront:'',//身份证正面照
        identityTail:'',//身份证反面照
        identityHand:'',//手持身份证

        img_front:'',//正面照【媒体id
        img_reverse:'',//反面照  媒体id
        hand_img_front:'',//手持身份证正面照
        unique_identifier:'',//身份证唯一标识
      }
    },
    /**
     * 路由切入之前，获取进入页面所需的内容
     * @param to 前往的路由参数
     * @param form 哪里来的路由参数
     * @param next 下一步
     * */
    beforeRouteEnter(to,from,next){
      console.log(to.query);
      http.post('/grant/public/get-scan-sign', {
        url: window.location.href.split('#')[0]
      }).then(res => {
        next(vm => { // 当成功时候，进行数据赋值
          if(res.code == 200){
            wx.config({
              debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
              appId: res.data.appId, // 必填，公众号的唯一标识
              timestamp: res.data.timestamp, // 必填，生成签名的时间戳
              nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
              signature: res.data.signature,// 必填，签名，见附录1
              jsApiList: ["chooseImage","uploadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            vm.account_name = to.query.account_name;
            vm.password = to.query.password;
            vm.phone = to.query.phone;
            vm.qq_number = to.query.qq_number;
            vm.province_code = to.query.province_code;
            vm.city_code = to.query.city_code;
            vm.area_code = to.query.area_code;
          }else{
            // 当错误的时候，进行错误统一处理
            vm.errorHandler(res);
          }
        })
      });
    },
    computed: {
      ...mapGetters([
        'registerInfo','zoneInfo','registerInfo'
      ]),
      /**
       *  判断输入信息是否为空
       **/
      isDis(){
        if (!this.img_front) {
          return false;
        } else if(!this.img_reverse){
          return false;
        } else if(!this.hand_img_front){
          return false;
        }else if(!/^[\u4e00-\u9fa5]+(·[\u4e00-\u9fa5]+)*$/.test(this.user_name) ){
          return false;
        }else if(!/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(this.card_num)){
          return false;
        }
        return true;
      }
    },
    methods: {
      ...mapActions([
        'agentAreaServer',
        "getAreaServer",
        'registerServer',
        'wxImgConfigServer',// 获取微信上传图片配置信息
        'grantRegisterServer',// 识别上传 正面照 信息U
        'imgploadServer',// 获取上次图片链接
      ]),

      /**
      * 公共方法 wx上传
      * @param typeNum 照片类型 1： 正面照 ； 2： 反面照 ； 3：手持身份证正面照
      * */
      wxUploadImg(typeNum){
        let that = this;
        wx.ready(function () {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
              that.loadingShow = true;    //显示loading层
              var localIds = res.localIds[0].toString(); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
              setTimeout(()=>{
                wx.uploadImage({
                  localId: localIds, // 需要上传的图片的本地ID，由chooseImage接口获得
                  isShowProgressTips: 1, // 默认为1，显示进度提示
                  success: function (res) {
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    if(typeNum == 1){ //上传正面照
//                      that.img_front = serverId; //正面照id
                      that.grantRegisterServer({
                        media_id:serverId,
                      }).then(res=>{
                        that.loadingShow = false;   //loading 层显示
                        if(res.code == 200){
//                          that.identityFront = localIds; //身份证 图片

                          if(!that.user_name){
                            that.user_name = res.data.user_name;
                          }
                          if(!that.card_num){
                            that.card_num = res.data.card_num;
                          }

                          that.showIdCard = true;//上传成功后 显示 身份证部分
                          that.unique_identifier = res.data.unique_identifier;

                          that.imgploadServer({
                            media_id:serverId,
                          }).then(res=>{
                            if(res.code==200){
                              that.identityFront = res.data.img; //身份证 图片
                              that.img_front = res.data.img; //正面照链接
                            }else{
                              that.errorHandler(res);
                            }
                          })
                        }else{
                          that.errorHandler(res);
                        }
                      })
                    }else if(typeNum ==2){ //上传反面照

//                      that.img_reverse = serverId; //反面照id
//                      that.identityTail = localIds;
                      that.imgploadServer({
                        media_id:serverId,
                      }).then(res=>{
                        if(res.code==200){
                          that.identityTail = res.data.img; //身份证 图片
                          that.img_reverse = res.data.img; //反面照链接
                        }else{
                          that.errorHandler(res);
                        }
                      })
                      that.loadingShow = false;   //loading 层显示
                    }else if(typeNum ==3){//上传手持身份证正面照
//                      that.hand_img_front = serverId; //反面照id
//                      that.identityHand = localIds;
                      that.imgploadServer({
                        media_id:serverId,
                      }).then(res=>{
                        if(res.code==200){
                          that.identityHand = res.data.img; //身份证 图片
                          that.hand_img_front = res.data.img; //反面照链接
                        }else{
                          that.errorHandler(res);
                        }
                      })
                      that.loadingShow = false;   //loading 层显示
                    }
                  }
                });
              },100);
            }
          })
        });
      },
      /**
       * 检测输入信息
       * */
      checkInfo(){

        if (!this.img_front) {
          Toast({
            message: '请选择正面照',
            duration: 1000
          });
          return false;
        } else if (!this.img_reverse) {
          Toast({
            message: '请选择反面照',
            duration: 1000
          });
          return false;
        } else if (!this.hand_img_front){
          Toast({
            message: '请选择手持身份证正面照',
            duration: 1000
          });
        }else if(!this.user_name){
          this.$refs.userName.focus();
          Toast({
            message:'请输入身份证姓名',
            duration: 1000
          });
          return false;
        }else if(!this.card_num){
          this.$refs.cardNum.focus();
          Toast({
            message:'请输入身份证号码',
            duration: 1000
          });
          return false;
        }
        return true;

      },


      /**
       * 注册按钮事件
       * */
      registerAction(){
        if (!this.checkInfo()) return;
        this.isDis = true;

        this.examineShow = true;

        this.registerServer({
          account_name: this.registerInfo.user_name,
          password: this.registerInfo.password,
          contact_person: this.registerInfo.name,
          phone: this.registerInfo.phone,
          qq_number: this.registerInfo.qq_number,
          province_code: this.registerInfo.provinceCode,
          city_code: this.registerInfo.cityCode,
          area_code: this.registerInfo.areaCode,
          img_front:this.img_front,
          user_name: this.user_name,
          card_num: this.card_num,
          img_reverse:this.img_reverse,
          unique_identifier:this.unique_identifier,
          checked:this.registerInfo.checked,
          hand_img_front:this.hand_img_front
        }).then(res => {
          if (res.code == 200) {
            Toast({
              message: '注册成功',
              duration: 1000
            });
            this.$router.replace({name: 'checkStatus'});
            this.isDis = false;
          } else{ // 当错误的时候，进行错误统一处理
            this.$refs.userName.focus();
            this.errorHandler(res);
            this.isDis = false;
          }
        });
      },
      /**
       * 返回上一层
       * */
      registerReturnAction(){
        this.$router.back(-1);
      },
    },
  }
</script>

<style lang="less" scoped>
  @import "./../../styles/modules/loginRegister";
  @import "./../../styles/modules/quickPush";
  .id-card-port{
    .pxToRem(height,77);
    .pxToRem(margin-top,20);

    .id-card-content{
      display: flex;
      flex-wrap: nowrap;
      width:100%;
      height:100%;
      border-radius: 3px;
      background-color: #f2fbff;
      overflow: hidden;

      i{
        display: inline-block;
        .pxToRem(width,38);
        .pxToRem(height,38);
        .pxToRem(margin-left,15);
        .pxToRem(margin-right,13);
        .pxToRem(margin-top,18);
        background: url('./../../assets/images/loginRegister/idCardImg.png') no-repeat;
        background-size: 100% 100%;
      }
      .id-card-box{
        display: flex;
        flex-direction: column;
        justify-content: center;
        line-height: 1;
        font-size: 0;
        vertical-align: top;

        .id-card-name{
          color: #555;
          .pxToRem(font-size,16);
          .card-name{
            .pxToRem(width,180);
          }
        }

        .id-card-number{
          .pxToRem(margin-top,14);
          color: #555;
          .pxToRem(font-size,16);
          .card-num{
            .pxToRem(width,180);
          }
        }
      }
    }
  }
  .side-title{
    margin-bottom:0;
  }
  .positive-title,.side-title{
    width:50%;
    padding-left: 0;
  }
  li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-name,.card-num{
  .pxToRem(padding-left,5);
    background-color: #f2fbff;
  }

  .picker-items {
    background: #fff !important;
  }

  .loading-style {
    display: inline-block;
   .pxToRem(margin-top,-40);
   .pxToRem(margin-left,-15);
  }


  input {
  .pxToRem(width,200);
    border: none;
  .pxToRem(font-size,16);
  }

</style>
