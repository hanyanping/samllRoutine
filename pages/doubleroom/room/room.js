// pages/doubleroom/room/room.js
var webim = require('../../../utils/webim.js');
var webimhandler = require('../../../utils/webim_handler.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    role: 'enter',    // 表示双人会话的角色，取值'enter'表示加入者，'create'表示创建者
    roomid: '',       // 房间id
    roomname: '',     // 房间名称
    username: '',     // 用户名称
    config: {         //cameraview对应的配置项
      aspect: '3:4',  //设置画面比例，取值为'3:4'或者'9:16'
      minBitrate: 200,//设置码率范围为[minBitrate,maxBitrate]，双人建议设置为200~600
      maxBitrate: 500,
      beauty: 5,      //美颜程度，取值为0~9
      muted: false,   //设置推流是否静音
      camera: false,   //设置前后置摄像头，true表示前置
      operate: '',    //设置操作类型，目前只有一种'stop'，表示停止
      debug: false    //是否显示log
    },                      
    styles: {         //设置cameraview的大小
      width: '100vw',
      height: '80vh'
    },
    event: 0,       // 推流事件透传
    member: {},     //双人对端成员信息

    inputMsg: '',     // input信息
    comment: [],      // 评论区信息

    toview: '',     // 滚动条位置
    isShow: false,  // 是否显示页面
    exit: 0
  },
  /**
   * 通知事件
   * onGetMemberList：初始化成员列表
   * onMemberJoin：有人进入房间通知
   * onMemberQuit：有人退出房间通知
   * onRoomClose：房间解散通知
   * onRecvRoomTextMsg：收到其他成员文本消息通知
   * onFail：错误回调
   */
  
  onNotify: function (e) {
    var self = this;
    switch(e.detail.type) {
      case 'onGetMemberList': {
        /*
          进入房间后，房间内目前已经有哪些用户通过此通知返回，可以根据此通知来展示其他用户视频信息，
          本方案可以应用于多人与双人会话，针对双人会话，此处返回的用户列表只有一条
          e.detail.members：表示其他用户列表信息，在双人场景下只有一条，所以这里直接取e.detail.members[0]
        */
        // 拿到成员信息先判断成员数目，房间人数已满立即退出
        console.log('房间人数:', e.detail.members.length);
        if (e.detail.members.length > 1) {
          self.onNotify({
            detail: {
              type: 'onFail',
              errMsg: '房间人数已满'
            }
          }); 
          break;
        }
        self.data.member = e.detail.members[0];
        self.data.member.loading = false;
        self.data.member.playerContext = wx.createLivePlayerContext('rtcplayer');
        // 页面处于隐藏时候不触发渲染
        self.data.isShow && self.setData({ member: self.data.member });
        break;
      }
      case 'onMemberJoin': {
        /*
          当有新的用户进入时会通知出来，可以根据此通知来展示新进入用户信息
          本方案可以应用于多人与双人会话，针对双人会话，此处返回的用户信息只有一条
          e.detail.members：表示新进入用户列表信息，在双人场景下只有一条，所以这里直接取e.detail.members[0]
        */
        self.data.member = e.detail.members[0];
        self.data.member.loading = false;
        self.data.member.playerContext = wx.createLivePlayerContext('rtcplayer');
        // 页面处于隐藏时候不触发渲染
        self.data.isShow && self.setData({ member: self.data.member });
        break;
      }
      case 'onMemberQuit': {
        /*
          当有用户退出时会通知出来
          e.detail.members：表示退出用户列表信息，此处双人场景只有一个人，有人退出就直接将对端成员信息置为空
        */
        self.setData({ member: {} });
        console.log("Quit")
        self.onUnload()
        break;
      }
      case 'onRoomClose': {
        /*
          房间关闭时会收到此通知，客户可以提示用户房间已经关闭，做清理操作
        */
        self.data.config.operate = 'stop';
        self.setData({
          config: self.data.config
        });

        self.data.member.playerContext && self.data.member.playerContext.stop();
        // 在房间内部才显示提示
        var pages = getCurrentPages();
        console.log(pages, pages.length, pages[pages.length - 1].__route__);
        if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/doubleroom/room/room')) {
          wx.showModal({
            title: '提示',
            content: e.detail.errMsg || '房间已解散',
            showCancel: false,
            complete: function () {
            pages = getCurrentPages();
              console.log(pages, pages.length, pages[pages.length - 1].__route__);
              if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/doubleroom/room/room')) {
                wx.navigateBack({ delta: 1 });
              }
            }
          });
        }
        break;
      }
      case 'onRecvRoomTextMsg': {
        /*
          收到房间用户的消息通知
          e.detail.content.textMsg：表示消息内容、
          e.detail.content.nickName：表示用户昵称
          e.detail.content.time：表示消息的接收时间
        */
        var self = this;
        self.data.comment.push({
          content: e.detail.content.textMsg,
          name: e.detail.content.nickName,
          time: e.detail.content.time
        });
        self.setData({
          comment: self.data.comment,
          toview: ''
        });
        // 滚动条置底
        self.setData({
          toview: 'scroll-bottom'
        });
        break;
      }
      case 'onFail': {
        /*
          各种内部错误，客户可以给出错误提示，做清理操作
          e.detail.errMsg：表示错误消息
        */
        self.data.config.operate = 'stop';
        self.setData({
          config: self.data.config
        });

        self.data.member.playerContext && self.data.member.playerContext.stop();
        // 5000不弹提示
        if (e.detail.errCode == 5000) {
          self.data.exit = 5000;
          break;
        }

        // 在房间内部才显示提示
        var pages = getCurrentPages();
        console.log(pages, pages.length, pages[pages.length - 1].__route__);
        if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/doubleroom/room/room')) {
          wx.showModal({
            title: '提示',
            content: e.detail.errMsg,
            showCancel: false,
            complete: function () {
              pages = getCurrentPages();
              if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/doubleroom/room/room')) {
                wx.navigateBack({ delta: 1 });
              }
            }
          });
        }
        break;
      }
    }
  },
  //接受拍照消息
  receivephone: function(){
    webimhandler.takePhone()
  },
  onPush: function(e){
    this.setData({ event: e.detail.code });
  },
  onPlay: function(e) {
    var self = this;
    switch (e.detail.code) {
      case 2007: {
        console.log('视频播放loading: ', e);
        self.data.member.loading = true;
        break;
      }
      case 2004: {
        console.log('视频播放开始: ', e);
        self.data.member.loading = false;
        break;
      }
      case -2301: {
        console.log('多次拉流重试失败: ', e);
        break;
      }
      default: {
        console.log('拉流情况：', e);
      }
    }
    self.setData({
      member: self.data.member
    });
  },
  bindInputMsg: function (e) {
    this.data.inputMsg = e.detail.value;
  },
  sendComment: function() {
    this.setData({ inputMsg: this.data.inputMsg });
    // 再发一条空，避免两次出现重复字符串没发生变化，不会再发送
    this.setData({ inputMsg: '' });
  },
  //切换前后摄像头
  changeCamera: function() {
    this.data.config.camera = !this.data.config.camera;
    this.setData({
      config: this.data.config
    });
  },
  //开启美颜
  setBeauty: function () {
    console.log("修改");
    this.data.config.beauty = (this.data.config.beauty == 0 ? 5 : 0);
    this.setData({
      config: this.data.config
    });
  },
  delayexcute:function(){

  },
  changeMute: function () {

    this.cameraContext = wx.createCameraContext('myc');

    var that = this;
    this.pusherContent = wx.createLivePusherContext('rtcpusher');
    //this.pusherContent.stop();
    this.pusherContent.pause();

    this.playerContent = wx.createLivePlayerContext('rtcplayer');
    this.playerContent.stop();
    
    setTimeout(function () {
      console.log("延迟3秒");

      that.cameraContext.takePhoto({
        success: function (res) {
          // var filePath = res.tempImagePath[0];
          console.log("图片路径" + res.tempImagePath);

          wx.saveImageToPhotosAlbum({
            filePath: res.tempImagePath,
            success: function (res) {
              console.log("图片保保存成功");
            },
            fail: function (error) {
              console.error("图片保存出错")
              console.warn(error)
            },
            complete: function () {

            }
          });
        },
        fail: function (error) {
          console.error("拍照失败")
          console.warn("拍照失败原因:" + error)
        },
        complete: function () {
          console.log("完成");
          that.pusherContent.resume();
          that.playerContent.play();
        }
      });

    }, 3000);

    // wx.chooseImage({
    //   count: 1,
    //   sourceType: ['camera'],
    //   success: function (res) {
    //     // 这里无论用户是从相册选择还是直接用相机拍摄，拍摄完成后的图片临时路径都会传递进来
    //     // app.startOperating("保存中")
    //     var filePath = res.tempFilePaths[0];
    //     console.log("路径"+filePath);
    //     that.pusherContent.start();
    //     // var session_key = wx.getStorageSync('session_key');
    //     // // 这里顺道展示一下如何将上传上来的文件返回给后端，就是调用wx.uploadFile函数
    //     // wx.uploadFile({
    //     //   url: app.globalData.url + '/home/upload/uploadFile/session_key/' + session_key,
    //     //   filePath: filePath,
    //     //   name: 'file',
    //     //   success: function (res) {
    //     //     app.stopOperating();
    //     //     // 下面的处理其实是跟我自己的业务逻辑有关
    //     //     var data = JSON.parse(res.data);
    //     //     if (parseInt(data.status) === 1) {
    //     //       app.showSuccess('文件保存成功');
    //     //     } else {
    //     //       app.showError("文件保存失败");
    //     //     }
    //     //   }
    //     // })
    //   },
    //   fail: function (error) {
    //     console.error("调用本地相册文件时出错")
    //     console.warn(error)
    //   },
    //   complete: function () {

    //   }
    // })
    console.log("修改");
    // this.data.config.muted = !this.data.config.muted;
    // this.setData({
    //   config: this.data.config
    // });
  },
  showLog: function () {
    console.log("修改2");
    this.data.config.debug = !this.data.config.debug;
    this.setData({
      config: this.data.config
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("ss"+JSON.stringify(options));
    console.log('room.js onLoad');
    var time = new Date();
    time = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
    console.log('*************开始多人音视频：' + time + '**************');
    this.data.role = options.type || 'enter';
   
    // this.data.roomid = options.roomID || 0;
  



    this.data.roomname = options.roomName;
    this.data.username = options.userName;
    this.setData({
      role: this.data.role,
      roomid: this.data.roomid,
      roomname: this.data.roomname,
      username: this.data.username
    });
    console.log('监听页面加载', this.data);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    if (!self.data.username) {
      wx.showModal({
        title: '提示',
        content: '登录信息还未获取到，请稍后再试',
        showCancel: false,
        complete: function () {
          var pages = getCurrentPages();
          console.log(pages, pages.length, pages[pages.length - 1].__route__);
          if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/doubleroom/room/room')) {
            wx.navigateBack({ delta: 1 });
          }
        }
      });
      return;
    }
    // 设置房间标题
    wx.setNavigationBarTitle({ title: self.data.roomname });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    console.log('room.js onShow');
    // 点圈圈退出
    if (self.data.exit == 5000) {
      self.data.member.playerContext && self.data.member.playerContext.stop();
      wx.showModal({
        title: '提示',
        content: '你已退出',
        showCancel: false,
        complete: function () {
          var pages = getCurrentPages();
          var toUrl = '../doubleroom/launchVideo/launchVideo?userName=' + self.data.userName;
          console.log(pages, pages.length, pages[pages.length - 1].__route__);
          if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/doubleroom/room/room')) {
            wx.redirectTo({
              url: toUrl
            })
            // wx.navigateBack({ delta: 1 });
          }
        }
      });
      return;
    }
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    self.data.isShow = true;
    self.setData({
      member: self.data.member
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var self = this;
    console.log('room.js onHide');
    self.data.isShow = false;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('room.js onUnload');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '双人音视频',
      path: '/pages/doubleroom/roomlist/roomlist',
      imageUrl: '/pages/Resources/share.png'
    }
  }
})