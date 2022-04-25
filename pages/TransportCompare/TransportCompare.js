const { server_imagename } = require("../../utils/util.js");
// pages/TransportCompare/TransportCompare.js
const utils = require("../../utils/util.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,

    server_hostname: utils.server_hostname,
    server_imagename: server_imagename,

    departcity:"北京",
    arrivalcity:"广州",
    departdate:"2022-04-24",

    plan1:[
      {
        type:"a",
        no:"HU7809",
        company:"海航",
        departcity:"北京",
        arrivalcity:"广州",
        departport:"首都国际机场",
        arrivalport:"白云机场",
        departdate:"2022-04-24",
        arrivaldate:"2022-04-24",
        departtime:"17:45:00",
        arrivaltime:"21:14:00",
        minprice:2540,
      }
    ],

    plan2:[
      {
        type:"a",
        no:"MU2452",
        company:"东航",
        departcity:"北京",
        arrivalcity:"武汉",
        departport:"首都国际机场",
        arrivalport:"天河机场",
        departdate:"2022-04-24",
        arrivaldate:"2022-04-24",
        departtime:"11:40:00",
        arrivaltime:"14:10:00",
        minprice:780,
      },
      {
        type:"t",
        no:"G2055",
        company:"高铁",
        departcity:"武汉",
        arrivalcity:"广州",
        departport:"武汉站",
        arrivalport:"广州南站",
        departdate:"2022-04-24",
        arrivaldate:"2022-04-24",
        departtime:"17:45:00",
        arrivaltime:"21:15:00",
        minprice:538.5,
      }
    ],

    plan1_departtime:"",
    plan2_departtime:"",
    plan1_arrivaltime:"",
    plan2_arrivaltime:"",
    plan1_costtime:"",
    plan2_costtime:"",
    plan1_minprice:0,
    plan2_minprice:0,
    plan1_exchange:"",
    plan2_exchange:"",
    lesstime:0,
    lessprice:0,
    lesstime_value:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    var plan1 = that.data.plan1;
    var plan2 = that.data.plan2;
    that.setData({
      plan1_departtime:that.getTime(plan1[0].departtime),
      plan2_departtime:that.getTime(plan2[0].departtime),
      plan1_arrivaltime:that.getDate(plan1[plan1.length-1].arrivaldate) + " " + that.getTime(plan1[plan1.length-1].arrivaltime),
       plan2_arrivaltime:that.getDate(plan2[plan2.length-1].arrivaldate) + " " + that.getTime(plan2[plan2.length-1].arrivaltime),
      plan1_costtime:that.calCosttime(plan1[0].departdate + " " + plan1[0].departtime, plan1[plan1.length-1].arrivaldate + " " + plan1[plan1.length-1].arrivaltime),
      plan2_costtime:that.calCosttime(plan2[0].departdate + " " + plan2[0].departtime, plan2[plan2.length-1].arrivaldate + " " + plan2[plan2.length-1].arrivaltime),
      plan1_exchange:that.calExchange(plan1),
      plan2_exchange:that.calExchange(plan2),
      plan1_minprice:that.calMinPrice(plan1),
      plan2_minprice:that.calMinPrice(plan2),
      lesstime:that.cmpCosttime(plan1[0].departdate + " " + plan1[0].departtime, plan1[plan1.length-1].arrivaldate + " " + plan1[plan1.length-1].arrivaltime, plan2[0].departdate + " " + plan2[0].departtime, plan2[plan2.length-1].arrivaldate + " " + plan2[plan2.length-1].arrivaltime),
    });
    
    that.setData({
      lessprice:that.cmpMinPrice(),
    })

  },

  getDate: function (d) {
    var tmp = d.split("-");
    return tmp[1] + "-" + tmp[2];
  },

  getTime: function (d) {
    var tmp = d.split(":");
    return tmp[0] + ":" + tmp[1];
  },

  calCosttime: function(date1, date2) {
    var d = new Date(date1.replace(/-/g, "/"));
    var a = new Date(date2.replace(/-/g, "/"));
    var hour = parseInt((a.getTime() - d.getTime())/(1000 * 60 * 60));
    var minute = parseInt(((a.getTime() - d.getTime())%(1000 * 60 * 60))/(1000 * 60));
    // console.log(hour);
    // console.log(minute);
    var ans = "";
    if (hour > 0) ans += hour + "h";
    if (minute > 0) ans += minute + "min";
    return ans;
  },

  cmpCosttime: function(date1, date2, date3, date4) {
    var that = this;
    var d1 = new Date(date1.replace(/-/g, "/"));
    var a1 = new Date(date2.replace(/-/g, "/"));
    var d2 = new Date(date3.replace(/-/g, "/"));
    var a2 = new Date(date4.replace(/-/g, "/"));

    if (parseInt(a1.getTime() - d1.getTime()) < parseInt(a2.getTime() - d2.getTime())) {
      var tmp = parseInt(a2.getTime() - d2.getTime() - (a1.getTime() - d1.getTime()));
      var ans = "";
      var hour = parseInt(tmp/(1000 * 60 * 60));
      var minute = parseInt((tmp%(1000 * 60 * 60))/(1000 * 60));
      if (hour > 0) ans += hour + "h";
      if (minute > 0) ans += minute + "min";
      that.setData({
        lesstime_value:ans,
      });
      return 1;
    }else if (parseInt(a1.getTime() - d1.getTime()) > parseInt(a2.getTime() - d2.getTime())) {
      var tmp = parseInt(a1.getTime() - d1.getTime() - (a2.getTime() - d2.getTime()));
      var ans = "";
      var hour = parseInt(tmp/(1000 * 60 * 60));
      var minute = parseInt((tmp%(1000 * 60 * 60))/(1000 * 60));
      if (hour > 0) ans += hour + "h";
      if (minute > 0) ans += minute + "min";
      that.setData({
        lesstime_value:ans,
      });
      return 2;
    }
    else return 0;
  },

  calMinPrice: function(list) {
    var ans = 0.0;
    for (var i in list) {
      ans += list[i].minprice;
    }
    return ans;
  },

  cmpMinPrice: function() {
    var that = this;
    if (that.data.plan1_minprice > that.data.plan2_minprice) return 2;
    else if (that.data.plan1_minprice < that.data.plan2_minprice) return 1;
    return 0;
  },

  calExchange: function(list) {
    if (list.length == 1) return "直达";
    var sum = 0;
    for (var i = 0; i < list.length-1; i++) {
      var d = new Date((list[i].arrivaldate + " " + list[i].arrivaltime).replace(/-/g, "/"));
      var a = new Date((list[i+1].departdate + " " + list[i+1].departtime).replace(/-/g, "/"));
      var tmp = parseInt(a.getTime()-d.getTime());
      sum = sum + tmp;
    }
    var hour = parseInt(sum/(1000 * 60 * 60));
    var minute = parseInt(((a.getTime() - d.getTime())%(1000 * 60 * 60))/(1000 * 60));
    var ans = "换乘约";
    if (hour > 0) ans += hour + "h";
    if (minute > 0) ans += minute + "min";
    return ans;
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