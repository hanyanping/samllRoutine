// pages/main/main.js
var rtcroom = require('../../utils/rtcroom.js');
var getlogininfo = require('../../getlogininfo.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstshow: true,// 第一次显示页面
    imgArray: [
      { title: '服务介绍', imgUrl: '../Resources/serverProduce.png', tip: '', linkUrl:'../doubleroom/severIntroduce/severIntroduce', text: '了解我们' },
      { title: '我的理赔', imgUrl: '../Resources/myClaims.png', tip: '', linkUrl: '../doubleroom/myCliam/myCliam', text: '个人中心' }
    ],
    phone:'',
    canShow: 0,
    tapTime: '',		// 防止两次点击操作间隔太快
    entryInfos: [
      { icon: "../Resources/liveroom.png", title: "直播体验室", navigateTo: "../liveroom/roomlist/roomlist" },
      { icon: "../Resources/doubleroom.png", title: "双人音视频", navigateTo: "../doubleroom/roomlist/roomlist" },
      { icon: "../Resources/multiroom.png", title: "多人音视频", navigateTo: "../multiroom/roomlist/roomlist" },
      { icon: "../Resources/vodplay.png", title: "点播播放器", navigateTo: "../vodplay/vodplay" },
      { icon: "../Resources/push.png", title: "RTMP推流", navigateTo: "../push/push" },
      { icon: "../Resources/play.png", title: "直播播放器", navigateTo: "../play/play" },
      { icon: "../Resources/rtplay.png", title: "低延时播放", navigateTo: "../rtplay/rtplay" }
    ]
  },
  gotoVideo: function(){
    // var toUrl = '../doubleroom/launchVideo/launchVideo';
    wx.navigateTo({
      url: toUrl
    })
  },
  gotolink: function(event){
    var url = event.currentTarget.id;
    console.log(event);
    wx.navigateTo({
      url: url
    })
  },
  userPhoneInput: function(e){
    this.setData({
      phone: e.detail.value
    })
  },
  todoubleroom: function(e){
    this.data.phone = '13412343234'
    if(this.data.phone.length > 0){
      // 先获取登录信息
      var self = this;
      wx.showLoading({
        title: '登录信息获取中',
      })
      getlogininfo.getLoginInfo({
        type: 'double_room',
        success: function (ret) {
          self.data.firstshow = false;
          getApp().data.isGetLoginInfo = true;
          getApp().data.userName = ret.userName

          var userId = getApp().data.userId
          //注册接口：
          self.register()
          wx.hideLoading();
        },
        fail: function (ret) {
          self.data.isGetLoginInfo = false;
          wx.hideLoading();
          wx.showModal({
            title: '获取登录信息失败',
            content: ret.errMsg,
            showCancel: false,
            complete: function () {
              wx.navigateBack({});
            }
          });
        }
      });
    }else{
      wx.showModal({
        title: '',
        content: '请输入手机号',
        showCancel: false,
        complete: function () {
          wx.navigateBack({});
        }
      });
    }
    // if (this.data.canShow) {
    //   // if(1) {
    //   // 防止两次点击操作间隔太快
    //   var nowTime = new Date();
    //   if (nowTime - this.data.tapTime < 1000) {
    //     return;
    //   }
    //   var toUrl = '../doubleroom/roomlist/roomlist';
      
  
    //   wx.navigateTo({
    //     url: toUrl,
    //   });
    //   this.setData({ 'tapTime': nowTime });
    // } else {
    //   wx.showModal({
    //     title: '提示',
    //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。',
    //     showCancel: false
    //   });
    // }
  },
  register: function () {
    var self = this;
    self.data.userName = getApp().data.userName
    console.log(getApp().data.userName)
    var toUrl = '../doubleroom/launchVideo/launchVideo?userName=' + this.data.userName;
    // var toUrl = '../doubleroom/roomlist/roomlist';
    var data = {
      "phone": this.data.phone,
      "imuserid": getApp().data.userId
    }
    wx.request({
      url: 'https://survey.zhongchebaolian.com/boot-zcbl-surveyor-api/surveyor/weixin/v1/regist',
      method: "post",
      data: {
        phone: '15012312312',
        imuserid: getApp().data.userId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
          wx.navigateTo({
            url: toUrl,
          });
      }
    })
  },
  onEntryTap: function (e) {
    var toUrl = this.data.entryInfos[e.currentTarget.id].navigateTo;
    console.log(this.data.entryInfos)
    console.log(toUrl);
    if (this.data.canShow) {
    // if(1) {
      // 防止两次点击操作间隔太快
      var nowTime = new Date();
      if (nowTime - this.data.tapTime < 1000) {
        return;
      }
      
      var toUrl = this.data.entryInfos[e.currentTarget.id].navigateTo;
      console.log(this.data.entryInfos)
      console.log(toUrl);
      wx.navigateTo({
        url: toUrl,
      });
      this.setData({ 'tapTime': nowTime });
    } else {
      // wx.showModal({
      //   title: '提示',
      //   content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。',
      //   showCancel: false
      // });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
    return
    if(!wx.createLivePlayerContext) {
      setTimeout(function(){
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。',
          showCancel: false
        });
      },0);
    } else {
      // 版本正确，允许进入
      this.data.canShow = 1;
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide");

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload");

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("onPullDownRefresh");

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("onReachBottom");

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("onShareAppMessage");
    return {
      title: '腾讯视频云',
      path: '/pages/main/main',
      imageUrl: '../Resources/share.png'
    }
  }
})