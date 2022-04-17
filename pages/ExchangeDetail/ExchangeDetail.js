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

    departdate:"2022-04-11",
    departweek:"",
    startcity:"杭州",
    endcity:"上海",
    costtime:"22h44min",

    plans: [
      {
        type:"t",
        toolname:"高铁G180",
        departdate:"2022-04-10",
        day:1,
        departtime:"10:32",
        arrivaltime:"5:17",
        departcity:"杭州",
        arrivalcity:"北京",
        departport:"杭州东",
        arrivalport:"北京西",
        costtime:"18h45min",
        money:586
      },
      {
        type:"a",
        toolname:"海南航空HU7613",
        departdate:"2022-04-11",
        day:0,
        departtime:"07:00",
        arrivaltime:"09:15",
        departcity:"北京",
        arrivalcity:"上海",
        departport:"首都国际机场 T2",
        arrivalport:"浦东国际机场 T2",
        costtime:"2h33min",
        money:780
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