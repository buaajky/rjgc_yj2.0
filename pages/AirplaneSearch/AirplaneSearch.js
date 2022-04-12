// pages/AirplaneSearch/AirplaneSearch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_date: '2016-11-08',

    dataList:[
      {
        air_company:'dh',
        air_number:'DH123456',
        air_date:'2022-4-11',
        air_time_start:'7:00',
        air_time_end:'11:00',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T2名字长一点',
        air_airport_end:'浦东国际机场 T2',
        air_price:'60'
      },
      {
        air_company:'nh',
        air_number:'NH123456',
        air_date:'2022-4-11',
        air_time_start:'7:00',
        air_time_end:'11:00',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T2',
        air_airport_end:'浦东国际机场 T2名字长一点',
        air_price:'111'
      },
      {
        air_company:'ch',
        air_number:'CH123456',
        air_date:'2022-4-11',
        air_time_start:'7:00',
        air_time_end:'11:00',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T2',
        air_airport_end:'浦东国际机场 T2',
        air_price:'60'
      },
      {
        air_company:'ch',
        air_number:'CH0000',
        air_date:'2022-4-11',
        air_time_start:'7:00',
        air_time_end:'11:00',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T2',
        air_airport_end:'浦东国际机场 T2',
        air_price:'6000'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    console.log(e.detail.value)
   this.setData({
    search_date: e.detail.value
   })
 }
})