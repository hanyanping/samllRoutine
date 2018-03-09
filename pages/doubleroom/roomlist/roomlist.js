var rtcroom = require('../../../utils/rtcroom.js');
var getlogininfo = require('../../../getlogininfo.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		roomName: '',	// 房间名称
		userName: '',	// 用户名称
		roomList: [],	// 房间列表
	
		firstshow: true,// 第一次显示页面
		tapTime: ''		// 防止两次点击操作间隔太快
	},
	/**
	 * [getRoomList 拉取房间列表]
	 * @return {[type]} [description]
	 */
	getRoomList: function () {
    console.log('获取房间列表!');
		var self = this;
	
		rtcroom.getRoomList({
			data: {
				index: 0,
				cnt: 20
			},
			success: function (ret) {
				self.setData({
					roomList: ret.rooms
				});
				console.log('获取房间列表成功');
			},
			fail: function (ret) {
				console.log(ret);
				wx.showModal({
					title: '获取房间列表失败',
					content: ret.errMsg,
					showCancel: false
				})
			}
		});
	},
 
	/**
	 * [create 创建房间，进入创建页面]
	 * @return {[type]} [description]
	 */
	create: function () {
		var self = this;
		// 防止两次点击操作间隔太快
		var nowTime = new Date();
		if (nowTime - this.data.tapTime < 1000) {
			return;
		}
    if (!getApp().data.isGetLoginInfo) {
      wx.showModal({
        title: '提示',
        content: '登录信息初始化中，请稍后再试',
        showCancel: false
      })
      return;
    }
		var url = '../roomname/roomname?type=create&roomName=' + self.data.roomName + '&userName=' + self.data.userName;
		wx.navigateTo({
			url: url
		});
		self.setData({ 'tapTime': nowTime });
	},
	
	/**
	 * [goRoom 进入rtcroom页面]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	goRoom: function (e) {
		// 防止两次点击操作间隔太快
		var nowTime = new Date();
		if (nowTime - this.data.tapTime < 1000) {
			return;
		}
    if (e.currentTarget.dataset.num > 1) {
      wx.showModal({
        title: '提示',
        content: '房间人数已满',
        showCancel: false,
        complete: function () {}
      });
      return;
    }
		var url = '../room/room?roomID=' + e.currentTarget.dataset.roomid + '&roomName=' + e.currentTarget.dataset.roomname + '&userName=' + this.data.userName;
		wx.navigateTo({ url: url });
		this.setData({ 'tapTime': nowTime });
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		// 先获取登录信息
		var self = this;
    self.getRoomList();
   
    self.data.userName = getApp().data.userName
    console.log('我的昵称：', self.data.userName);
    self.setData({
      userName: self.data.userName
    });
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		console.log('roomlist onshow');
		// 页面显示就拉取一次房间列表
		!this.data.firstshow && this.getRoomList();
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
    wx.navigateBack({
      url: '../../main/main'
    })
    rtcroom.unInit();
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		this.getRoomList(function () { });
		wx.stopPullDownRefresh();
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