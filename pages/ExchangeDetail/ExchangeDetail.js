const { server_imagename } = require("../../utils/util.js");
// pages/ExchangeDetail/ExchangeDetail.js
const utils = require("../../utils/util.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,

    server_hostname: utils.server_hostname,
    server_imagename: server_imagename,

    notice: "这是防疫公告这是防疫公告这是防疫公告这是防疫公告",

    departdate:"2022-04-24",
    departweek:"",
    startcity:"北京",
    endcity:"广州",
    costtime:"9h23min",

    plans: [
      {
        type:"a",
        toolname:"东航MU2452",
        departdate:"2022-04-24",
        day:0,
        departtime:"11:40",
        arrivaltime:"14:10",
        departcity:"北京",
        arrivalcity:"武汉",
        departport:"大兴国际机场",
        arrivalport:"天河机场 T3",
        costtime:"2h30min",
        money:780
      },
      {
        type:"t",
        toolname:"高铁G2055",
        departdate:"2022-04-24",
        day:0,
        departtime:"16:43",
        arrivaltime:"21:03",
        departcity:"武汉",
        arrivalcity:"广州",
        departport:"武汉",
        arrivalport:"广州南",
        costtime:"4h20min",
        money:538.5
      }
    ],

    //交互控制
    showNotice:false,//是否显示完整的通知（半屏弹窗）
    hastrain:false//是否显示12306
  },

  clickNoticeBar: function() {
    this.setData({
      showNotice: true
    })
  },

  addToPlan: function() {
    console.log("add2plan")
    wx.showToast({
      title: '已加入出行计划',
      duration: 1000
    })
  },

  navigate2detail: function(e) {//跳转到详情页
    console.log(this.data.plans[parseInt(e.target.id)])
    var tmp = this.data.plans[parseInt(e.target.id)];
    if (tmp.type == 'a') {
      wx.navigateTo({
        url: '/pages/PlaneDetail/PlaneDetail',
      })
    }else if (tmp.type == 't') {
      wx.navigateTo({
        url: '/pages/TrainDetail/TrainDetail',
      })
    }
  },

  navigateTo12306:function() {
    wx.navigateTo({
      url: '/pages/12306/12306',
    })
  },

  navigate2map: function() {//在地图上查看
    var that = this;
    var tmp = [];
    for(var i in that.data.plans) {
      var extra = "";
      if (that.data.plans[i].type == "t") extra = "站";
      tmp.push({
        type: that.data.plans[i].type,
        city1: that.data.plans[i].departcity,
        city2: that.data.plans[i].arrivalcity,
        port1: that.data.plans[i].departport.split(' ')[0] + extra,
        port2: that.data.plans[i].arrivalport.split(' ')[0] + extra,
      })
    }

    wx.navigateTo({
      url: '/pages/TransportMap/TransportMap?plans=' + JSON.stringify(tmp),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show
    })

    // console.log(options)
    var that = this;
    that.setData({
      departweek: utils.getWeekByDate(that.data.departdate)
    })
    that.calHasTrain();
  },

  calHasTrain:function() {
    var that = this;
    for (let item of that.data.plans) {
      console.log(item);
      if (item.type == 't') {
        that.setData({
          hastrain:true
        })
        break;
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})