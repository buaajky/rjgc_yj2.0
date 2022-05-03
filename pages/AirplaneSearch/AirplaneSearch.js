const { server_hostname } = require("../../utils/util")

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
    dataList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this

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

   that.check_date(that.data.search_date)
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
      departdate: that.data.search_date,
      flightno: that.data.search_number,
      departure: that.data.start_city,
      arrival: that.data.end_city
    },
    success: (result) => {
      //console.log(result)
      if (result.data != "") {
        var tmp = []
        tmp.push(result.data)
      //console.log(tmp)
        this.setData({
          dataList: tmp,
          get_data: tmp == false ? false : true
        })
      }
      
    },
    fail: (res) => {},
  })
 },

navigate2air: function(e) {
  var that = this
  //console.log(e)
  var index = e.currentTarget.dataset.index
  console.log(index)
} 
})