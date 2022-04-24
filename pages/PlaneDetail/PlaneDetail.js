const { server_imagename } = require("../../utils/util.js");
// pages/PlaneDetail.js
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
    arrivaldate:"2022-04-24",
    departtime:"11:40",
    arrivaltime:"14:10",
    departcity:"北京",
    arrivalcity:"武汉",
    departport:"大兴国际机场",
    arrivalport:"天河机场 T2",
    costtime:"2h30min",
    flightno:"MU2452",
    flightcom:"东航",
    punc:"95",//准点率
    food:0,
    foodlist:["无", "有"],
    craft:"738",
    overdate:"",

    jjcPrices:[
      {
        price:780,
        cabincode:"V",
        discount:40
      },
      {
        price:880,
        cabincode:"Y",
        discount:40
      },
      {
        price:780,
        cabincode:"V",
        discount:40
      },
      {
        price:880,
        cabincode:"Y",
        discount:40
      },
      {
        price:780,
        cabincode:"V",
        discount:40
      },
      {
        price:880,
        cabincode:"Y",
        discount:40
      },
      {
        price:880,
        cabincode:"Y",
        discount:40
      }
    ],

    gwcPrices:[
      {
        price:1780,
        cabincode:"B",
        discount:440
      },
      {
        price:1880,
        cabincode:"C",
        discount:450
      },
      {
        price:1780,
        cabincode:"B",
        discount:440
      },
      {
        price:1880,
        cabincode:"C",
        discount:450
      }
    ],
    
    //交互控制
    screen_h: 750,//手机屏幕高度，onLoad中获取
    tab_content_h: 600,//滑动是动态设置scroll-view的高度
    showNotice:false,//是否显示完整的通知（半屏弹窗）

    scrollTop: undefined
  },

  onPageScroll: function(res) {//监听页面滑动
    this.setData({
      scrollTop: res.scrollTop//吸顶容器l-sticky
    })
    this.setTabContentHeight()//自适应改scroll-view的高度
  },

  clickNoticeBar: function() {//弹出 防疫公告
    this.setData({
      showNotice: true
    })
  },

  addToPlan: function() {//加入出行计划 按钮
    console.log("add2plan")
    wx.showToast({
      title: '已加入出行计划',
      duration: 1000
    })
  },

  navigate2map: function() {//在地图上查看
    var that = this;
    var tmp = [{
      type:"a",
      city1: that.data.departcity,
      city2: that.data.arrivalcity,
      port1: that.data.departport.split(' ')[0],
      port2: that.data.arrivalport.split(' ')[0],
    }];
    wx.navigateTo({
      url: '/pages/TransportMap/TransportMap?plans=' + JSON.stringify(tmp),
    })
  },

  // getNoticeBar(){
  //   // 模拟 API 获取内容
  //   let apiContent = wx.request("...");
  
  //   this.setData({
  //     notice: apiContent
  //   },()=>{
  //     // 获取 notice-bar 组件实例
  //     const noticeBarComponent = this.selectComponent("#my-notice-bar");
  //     // 刷新组件动画
  //     noticeBarComponent.linFlush();
  //   });
  // }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show,
      screen_h: wx.getSystemInfoSync().screenHeight,
    })
    
    // console.log(options)
    var that = this
    that.setData({
      departweek: utils.getWeekByDate(that.data.departdate)
    })
    
    // console.log(utils.getWeekByDate("2022-04-10"))
    that.setTabContentHeight()
    that.setOverdate()
  },

  setTabContentHeight: function() {//票价滑动 自适应高度
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#tab-content').boundingClientRect()
    query.exec(function(res){
      that.setData({
        tab_content_h: wx.getSystemInfoSync().windowHeight - res[0].top//屏幕高度 - #tab-content节点的上边界坐标
      })    
    })
    // console.log("now tab_content_h is")
    // console.log(that.data.tab_content_h)
  },

  setOverdate: function() {//计算当天/+x天
    var that = this
    if (that.data.departdate == that.data.arrivaldate) {
      that.setData({
        overdate: "当"
      })
    }else {
      var d = new Date(that.data.departdate.replace(/-/g, "/") + " 00:00:00")
      var a = new Date(that.data.arrivaldate.replace(/-/g, "/") + " 00:00:00")
      console.log(d.getDay)
      var day = parseInt((a.getTime() - d.getTime())/(1000 * 60 * 60 *24))
      console.log(day)
      that.setData({
        overdate: "+" + day
      })
    }
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

  }
})