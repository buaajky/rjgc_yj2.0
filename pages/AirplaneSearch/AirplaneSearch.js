const { server_hostname } = require("../../utils/util");
const utils = require("../../utils/util.js");

// pages/AirplaneSearch/AirplaneSearch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_date: '2022-04-15',
    search_number: '9C8649',//MU6527
    start_city: '南昌',
    end_city: '兰州',
    get_data:false,
    dataList:[],
    alldataList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this
    that.setData({
      search_date:options.date,
      search_number:options.planeNum
    })
    that.check_date(that.data.search_date)
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

  },

  bindDateChange: function (e) {
    var that = this
    console.log(e.detail.value)
   that.setData({
    search_date: e.detail.value
   })

   that.searchByDate(that.data.search_date)
 },

 check_date: function(date) {
  var that = this
  that.setData({
    get_data: false,
    dataList: []
  })
  wx.request({
    url: server_hostname + '/api/core/flights/getFlightNo',
    method: 'GET',
    data: {
      // departdate: that.data.search_date,
      flightno: that.data.search_number,
      // departure: that.data.start_city,
      // arrival: that.data.end_city
    },
    success: (result) => {
      console.log(result)
      if (result.data != "") {
        console.log(result.data)
        that.setData({
          alldataList: result.data,
          get_data: true
        })
      }
      that.searchByDate(date);
      console.log(that.data);
    },
    fail: (res) => {},
  })
 },

 searchByDate:function(date) {
  var tmp = [];
  var that = this;
  for (var i in that.data.alldataList) {
    if (that.data.alldataList[i].departdate == date) tmp.push(that.data.alldataList[i]);
  }
  for (var i in tmp) {
    tmp[i].airline = utils.airline_Chinese_to_number(tmp[i].airline)
  }
  that.setData({
    dataList:tmp
  })
 },

navigate2air: function(e) {
  var that = this;
  //console.log(e)
  var index = e.currentTarget.dataset.index;
  console.log(index);
  wx.navigateTo({
    url: '/pages/PlaneDetail/PlaneDetail?id=' + index,
  })
} 
})