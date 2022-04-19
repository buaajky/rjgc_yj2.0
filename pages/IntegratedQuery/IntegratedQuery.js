// pages/IntegratedQuery/IntegratedQuery.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_date: '2022-04-19',
    //sort_turn:true,

    airplaneList:[
      {
        air_company:'gh',
        air_number:'CA1831',
        air_date:'2022-4-19',
        air_time_start:'7:30',
        air_time_end:'10:00',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T3',
        air_airport_end:'上海虹桥机场 T2',
        air_price:1490
      },
      {
        air_company:'dh',
        air_number:'MU5142',
        air_date:'2022-4-19',
        air_time_start:'19:30',
        air_time_end:'21:45',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T2',
        air_airport_end:'上海虹桥机场 T2',
        air_price:1960
      },
      {
        air_company:'hh',
        air_number:'HU7613',
        air_date:'2022-4-19',
        air_time_start:'7:00',
        air_time_end:'9:20',
        air_city_start:'北京',
        air_city_end:'上海',
        air_airport_start:'首都国际机场 T2',
        air_airport_end:'浦东国际机场 T2',
        air_price:1960
      }
    ],
    trainList:[
      {
        train_company:'zt',
        train_number:'K1071',
        train_date:'2022-4-19',
        train_time_start:'12:11',
        train_time_end:'17:11',
        train_city_start:'北京',
        train_city_end:'上海',
        train_station_start:'北京南站',
        train_station_end:'上海虹桥站',
        train_price:172
      },
      {
        train_company:'zt',
        train_number:'G17',
        train_date:'2022-4-19',
        train_time_start:'15:00',
        train_time_end:'19:34',
        train_city_start:'北京',
        train_city_end:'上海',
        train_station_start:'北京南站',
        train_station_end:'上海虹桥站',
        train_price:626
      }
    ],
    transferList:[
      {
        t1_type:'飞机',
        t1_number:'CZ8857',
        t1_date:'2022-4-19',
        t1_time_start:'10:00',
        t1_time_end:'12:20',
        t1_city_start:'北京',
        t1_city_end:'杭州',
        t1_station_start:'大兴',
        t1_station_end:'萧山 T3',
        t2_type:'火车',
        t2_number:'G7376',
        t2_date:'2022-4-19',
        t2_time_start:'15:40',
        t2_time_end:'16:33',
        t2_city_start:'杭州',
        t2_city_end:'上海',
        t2_station_start:'杭州东站',
        t2_station_end:'上海虹桥站',
        total_price:298,
        total_time:'6时33分',
        transfer_time:'3时20分'
      },
      {
        t1_type:'火车',
        t1_number:'G33',
        t1_date:'2022-4-19',
        t1_time_start:'8:56',
        t1_time_end:'13:28',
        t1_city_start:'北京',
        t1_city_end:'杭州',
        t1_station_start:'北京南站',
        t1_station_end:'杭州东站',
        t2_type:'火车',
        t2_number:'G7376',
        t2_date:'2022-4-19',
        t2_time_start:'15:40',
        t2_time_end:'16:33',
        t2_city_start:'杭州',
        t2_city_end:'上海',
        t2_station_start:'杭州东站',
        t2_station_end:'上海虹桥站',
        total_price:694.5,
        total_time:'7时37分',
        transfer_time:'2时21分'
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
 },

 sort_price_down: function (e) {
   var self = this;
  self.setData({
    //sort_turn: e.currentTarget.dataset.sort_turn,
    airplaneList: self.data.airplaneList.sort(function (x,y) {
      return y.air_price-x.air_price;
    }),
    trainList: self.data.trainList.sort(function (x,y) {
      return y.train_price-x.train_price;
    }),
    transferList: self.data.transferList.sort(function (x,y) {
      return y.total_price-x.total_price;
    })
  })
  },

  sort_price_up: function (e) {
    var self = this;
    self.setData({
      //sort_turn: e.currentTarget.dataset.sort_turn,
      airplaneList: self.data.airplaneList.sort(function (x,y) {
        return x.air_price-y.air_price;
      }),
      trainList: self.data.trainList.sort(function (x,y) {
        return x.train_price-y.train_price;
      }),
      transferList: self.data.transferList.sort(function (x,y) {
        return x.total_price-y.total_price;
      })
    })
    }


})