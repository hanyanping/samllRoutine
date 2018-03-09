// pages/doubleroom/roomname/roomname.js
var webimhandler = require('../../../utils/webim_handler.js');
var webim = require('../../../utils/webim.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    toastHidden: true, //吐司  
    toastText: '',//吐司文本  
		roomName: '',	// 房间名称
		userName: '',	// 用户名称
    role: 'enter',    // 表示双人会话的角色，取值'enter'表示加入者，'create'表示创建者
    roomid: '',       // 房间id
		tapTime: ''		// 防止两次点击操作间隔太快
	},

	
	/**
	 * [bindRoomName 绑定输入框]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	// bindRoomName: function (e) {
	// 	var self = this;
	// 	self.setData({
	// 		roomName: e.detail.value
	// 	});
	// },
	
	/**
	 * [create 进入rtcroom页面]
	 * @return {[type]} [description]
	 */
  onToastChanged: function () {
    this.setData({ toastHidden: !this.data.toastHidden });
  }, 
	create: function () {
		var self = this;
		// 防止两次点击操作间隔太快
		var nowTime = new Date();
		if (nowTime - this.data.tapTime < 1000) {
			return;
		}
    self.setData({
			roomName: '韩小屋'
		});
    var url = '../room/room?type=create&roomName=' + self.data.roomName + '&userName=' + self.data.userName;
    wx.redirectTo({
      url: url
    });
    wx.showToast({
      title: '进入房间',
      icon: 'success',
      duration: 1000
    })
		// if (/[<>*{}()^%$#@!~&= ]/.test(self.data.roomName) || !self.data.roomName) {
		// 	wx.showModal({
		// 		title: '提示',
    //     content: '名称不能为空或包含特殊字符',
		// 		showCancel: false
		// 	});
		// 	return;
		// };
  
	},


	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			userName: options.userName || ''
		});
     
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

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
      imageUrl: '../../Resources/share.png'
    }
	}
})