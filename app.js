//app.js

var qcloud = require('./lib/index');

App({
  onLaunch: function () {
    // 展示本地存储能力
    // qcloud.setLoginUrl(config.url + 'getwxinfo');
    // qcloud.setLoginUrl(config.url + 'login');
  },
  globalData: {
    userInfo: null
  },
  data: {
    userId: "",
    isGetLoginInfo: false,  // 是否已经获取登录信息
    userName: '',	// 用户名称
    seletoID:  '',//webid
    roomID: '',//房间id
    
  } 
})