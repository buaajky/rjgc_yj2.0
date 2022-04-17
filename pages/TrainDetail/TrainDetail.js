const { server_imagename } = require("../../utils/util.js");
// pages/TrainDetail/TrainDetail.js
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

    departdate:"2022-04-01",
    departweek:"",
    startcity:"杭州",
    endcity:"北京",
    typename:"高铁",

    startstation:"杭州东",
    endstation:"北京南",
    trainno:"G180",
    departtime:"10:32",
    arrivaltime:"17:17",
    costtime:"6h45min",
    day:0,
    overdate:"",
    departstation:"宁海",
    terminalstation:"北京南",
    isend:1,

    prices: [
      {
        name:"一等座",
        price:1007,
        num:"有",
      },
      {
        name:"二等座",
        price:538.5,
        num:1000,
      },
      {
        name:"商务座",
        price:1538.5,
        num:"无",
      }
    ],
    
    //交互控制
    screen_h: 750,//手机屏幕高度，onLoad中获取
    tab_content_h: 600,//滑动是动态设置scroll-view的高度
    showNotice:false,//是否显示完整的通知（半屏弹窗）

    scrollTop: undefined
  },

  onPageScroll: function(res) {
    this.setData({
      scrollTop: res.scrollTop
    })
    this.setTabContentHeight()//自适应改scroll-view的高度
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

  navigateTo12306:function() {
    wx.navigateTo({
      url: '/pages/12306/12306',
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
  onLoad(options) {
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

  setTabContentHeight: function() {
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

  setOverdate: function() {
    var that = this
    if(that.data.day == 0) {
      that.setData({
          overdate: "当"
      })
    }else {
      that.setData({
        overdate: "+" + that.data.day
    })
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