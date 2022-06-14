const { server_hostname } = require("../../utils/util")
const utils = require("../../utils/util.js");

// pages/IntegratedQuery/IntegratedQuery.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_date: '2022-05-05',
    start_city: '北京',
    end_city: '北京',//北京南京
    compare_show: false,
    compare_num: 0,

    get_data_train: false,
    get_data_air: false,
    get_data_transfer: false,
    airplaneList:[],
    trainList:[],
    transferList:[],

    search_type:"one",//控制tab初始页面
    search_type_map:{"飞机":"one", "火车":"two", "换乘":"three"},
    start: "2022-01-01",
    end: "2023-12-31",
    result_null_air: "没有合适结果",
    result_null_train: "没有合适结果",
    result_null_transfer: "没有合适结果"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this

    that.setData({
      get_data_air: false,
      get_data_train: false,
      get_data_transfer: false,
      start_city:options.departure,
      end_city:options.arrival,
      search_date:options.date,
      search_type:that.data.search_type_map[options.searchType]
    })

    wx.setNavigationBarTitle({
      title: that.data.start_city + "-" + that.data.end_city,
    })

    that.get_air_list(that.data.search_date)
    that.get_train_list(that.data.search_date)
    that.get_transfer_list(that.data.search_date)
    that.sort_price_up();
    
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
    var that = this
    that.setData({
      get_data_air: false,
      get_data_train: false,
      get_transfer_list: false,
      trainList: [],
      airplaneList: [],
      transferList: []
     })
  
    that.get_air_list(that.data.search_date)
    that.get_train_list(that.data.search_date)
    that.get_transfer_list(that.data.search_date)
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
    //console.log(e.detail.value)
   that.setData({
    search_date: e.detail.value,
    get_data_air: false,
    get_data_train: false,
    get_data_transfer: false,
    trainList: [],
    airplaneList: [],
    transferList: []
   })

  that.get_air_list(that.data.search_date)
  that.get_train_list(that.data.search_date)
  that.get_transfer_list(that.data.search_date)
 },

 sort_price_down: function (e) {
   var self = this;
  self.setData({
    airplaneList: self.data.airplaneList.sort(function (x,y) {
      return y.minprice-x.minprice;
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
      airplaneList: self.data.airplaneList.sort(function (x,y) {
        return x.minprice-y.minprice;
      }),
      trainList: self.data.trainList.sort(function (x,y) {
        return x.train_price-y.train_price;
      }),
      transferList: self.data.transferList.sort(function (x,y) {
        return x.total_price-y.total_price;
      })
    })
    },

    selectList_airplane(e) {
      const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
      let tmp = this.data.airplaneList;                    // 获取购物车列表
      const selected = tmp[index].selected;         // 获取当前商品的选中状态
      tmp[index].selected = !selected;              // 改变状态
      this.setData({
        airplaneList: tmp,
        compare_num: tmp[index].selected ? this.data.compare_num + 1 : this.data.compare_num - 1
      });

  },

  selectList_train(e) {
    const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
    let tmp = this.data.trainList;                    // 获取购物车列表
    const selected = tmp[index].selected;         // 获取当前商品的选中状态
    tmp[index].selected = !selected;              // 改变状态
    this.setData({
      trainList: tmp,
      compare_num: tmp[index].selected ? this.data.compare_num + 1 : this.data.compare_num - 1
    });

},

selectList_transfer(e) {
  const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
  let tmp = this.data.transferList;                    // 获取购物车列表
  const selected = tmp[index].selected;         // 获取当前商品的选中状态
  tmp[index].selected = !selected;              // 改变状态
  this.setData({
    transferList: tmp,
    compare_num: tmp[index].selected ? this.data.compare_num + 1 : this.data.compare_num - 1
  });

},

compare_ready(e) {
  var self = this;
  self.setData({
    compare_show: !self.data.compare_show
  })
},

compare_cancel(e) {
  var self = this;
  var tmp1 = self.data.airplaneList;
  var tmp2 = self.data.trainList;
  var tmp3 = self.data.transferList;
  for (var i in tmp1) {
    tmp1[i].selected = false;
  }
  for (var i in tmp2) {
    tmp2[i].selected = false;
  }
  for (var i in tmp3) {
    tmp3[i].selected = false;
  }
  self.setData({
    compare_show: !self.data.compare_show,
    airplaneList: tmp1,
    trainList: tmp2,
    transferList: tmp3,
    compare_num: 0
  })
},

compare_do: function(e) {
  var that = this
  var tmp = []
  if (that.data.compare_num != 2) {
    wx.showToast({
      title: "请选择2个交通方案",
      icon: 'error'
    })
  }
  else {
    for (let i in that.data.airplaneList) {
      if (that.data.airplaneList[i].selected) {
        var item = {

        flightno: that.data.airplaneList[i].flightno,
        airline: that.data.airplaneList[i].airline_Chinese,
        city: that.data.airplaneList[i].city,
        endcity: that.data.airplaneList[i].endcity,
        departport: that.data.airplaneList[i].departport,
        arrivalport: that.data.airplaneList[i].arrivalport,
        departdate: that.data.airplaneList[i].departdate,
        departtime: that.data.airplaneList[i].departtime,
        arrivaldate: that.data.airplaneList[i].arrivaldate,
        arrivaltime: that.data.airplaneList[i].arrivaltime,
        costtime: that.getCosttime(that.data.airplaneList[i].costtime),
        minpric: that.data.airplaneList[i].minprice
        }
        tmp.push(item)
      }
    }
    for (let i in that.data.trainList) {
      if (that.data.trainList[i].selected) {
        var item = {

          trainno: that.data.trainList[i].trainno,
          typename: that.data.trainList[i].typename,
          departstation: that.data.trainList[i].station,
          endstation: that.data.trainList[i].endstation,
          departdate: that.data.trainList[i].departdate,
          departtime: that.data.trainList[i].departtime,
          arrivaldate: that.data.trainList[i].arrivaldate,
          arrivaltime: that.data.trainList[i].arrivaltime,
          costtime: that.data.trainList[i].costtime,
          train_price: that.data.trainList[i].train_price
          }
        tmp.push(item)
      }
    }
    for (let i in that.data.transferList) {
      if (that.data.transferList[i].selected) {
        var item = {
          t1_type:that.data.transferList[i].t1_type,
          t1_number:that.data.transferList[i].t1_number,
          t1_date:that.data.transferList[i].t1_date,
          t1_time_start:that.data.transferList[i].t1_time_start,
          t1_time_end:that.data.transferList[i].t1_time_end,
          t1_station_start:that.data.transferList[i].t1_station_start,
          t1_station_end:that.data.transferList[i].t1_station_start,
          t2_type:that.data.transferList[i].t2_type,
          t2_number:that.data.transferList[i].t2_number,
          t2_date:that.data.transferList[i].t2_date,
          t2_time_start:that.data.transferList[i].t2_time_start,
          t2_time_end:that.data.transferList[i].t2_time_end,
          t2_station_start:that.data.transferList[i].t2_station_start,
          t2_station_end:that.data.transferList[i].t2_station_end,
          total_price:that.data.transferList[i].total_price,
          total_time:that.data.transferList[i].total_time,
          transfer_time:that.data.transferList[i].transfer_time,
          t1_company:that.data.transferList[i].t1_company,
          t2_company:that.data.transferList[i].t2_company,
        }
        tmp.push(item)
      }
    }
    console.log(tmp)
    var param = {
      departdate:that.data.search_date,
      startcity:that.data.start_city,
      endcity:that.data.end_city,
      plan1:tmp[0],
      plan2:tmp[1],
    }
    wx.navigateTo({
      url: '/pages/TransportCompare/TransportCompare?tmp=' + JSON.stringify(param),
    })
  }
},

get_air_list:function(date) {
  var that = this
  that.setData({
    result_null_air: "查询中"
  })
  wx.request({
    url: server_hostname + '/api/core/flights/getThroughFlight',
    method: 'GET',
    data: {
      departure: that.data.start_city,
      arrival: that.data.end_city,
      date: that.data.search_date
    },
    success: (result) => {
      //console.log(result.data)
      var lll = result.data
      for (let i in lll) {
        lll[i].selected = false
        lll[i].arrivaltime = lll[i].arrivaltime.substring(0, 5)
        lll[i].departtime = lll[i].departtime.substring(0,5)
        lll[i].airline_Chinese = lll[i].airline
        lll[i].airline = utils.airline_Chinese_to_number(lll[i].airline)
      }
      lll.sort((a, b)=>{return a.minprice - b.minprice});
      that.setData({
        airplaneList: lll,
        result_null_air: "没有合适结果"
      })
      if (that.data.airplaneList != false) {
        that.setData({
          get_data_air: true
        })
      }
    },
    fail: (res) => {}
  })
},

get_train_list:function(e) {
  var that = this
  that.setData({
    result_null_train: "查询中"
  })
  wx.request({
    url: server_hostname + '/api/core/trains/getThroughTrain',
    method: 'GET',
    data: {
      departure: that.data.start_city,
      arrival: that.data.end_city,
      date: that.data.search_date
    },
    success: (result) => {
      //console.log(result.data)
      var lll = result.data
      for (let i in lll) {
        lll[i].selected = false
        var min = 1000000
        for (let j in lll[i].prices) {
          if (lll[i].prices[j].price < min) {
            min = lll[i].prices[j].price
          }
        }
        lll[i].train_price = min == 1000000 ? 0 : min
        lll[i].arrivaltime = lll[i].arrivaltime.substring(0,5)
        lll[i].departtime = lll[i].departtime.substring(0,5)
      }
      lll.sort((a, b)=>{return a.train_price - b.train_price});
      that.setData({
        trainList: lll,
        result_null_train: "没有合适结果"
      })
      if (that.data.trainList != false) {
        that.setData({
          get_data_train: true
        })
      }
    },
    fail: (res) => {}
  })
},

get_transfer_list: function(date) {
  var that = this
  that.setData({
    result_null_transfer: "查询中"
  })
  var trans = {
    t1_type:'',
    t1_number:'',
    t1_date:'',
    t1_time_start:'',
    t1_time_end:'',
    t1_station_start:'',
    t1_station_end:'',
    t2_type:'',
    t2_number:'',
    t2_date:'',
    t2_time_start:'',
    t2_time_end:'',
    t2_station_start:'',
    t2_station_end:'',
    total_price:0,
    total_time:'',
    transfer_time:'',
    selected:false,
    t1_id:'',
    t2_id:'',
    t1_company:'',
    t2_company:''
  }
  var tmp = []
  var tmp1 = []
  var index_list = 0
  wx.request({
    url: server_hostname + '/api/core/trains/getTransfer',
    method: 'GET',
    data: {
      departure: that.data.start_city,
      arrival: that.data.end_city,
      date: that.data.search_date
    },
    
    success: async function(result) {
      console.log(result.data)
      for (let i in result.data) {
        if (result.data[i].id1 == "") {
          continue
        }
        if (result.data[i].type1 == "火车") {
          await that.getTrainInfo(result.data[i].id1, trans, 1);
        }else if (result.data[i].type1 == "飞机") {
          await that.getPlaneInfo(result.data[i].id1, trans, 1);
        }

        if (result.data[i].type2 == "火车") {
          await that.getTrainInfo(result.data[i].id2, trans, 2);
        } else if (result.data[i].type2 == "飞机") {
          await that.getPlaneInfo(result.data[i].id2, trans, 2);
        }

        index_list++;
        tmp.push(JSON.parse(JSON.stringify(trans)))
        tmp.sort((a, b)=>{return a.total_price - b.total_price});
        that.setData({
          transferList: tmp
        })
        if (that.data.transferList != []) {
          that.setData({
            get_data_transfer: true
          })
        }
      }
      that.setData({
        result_null_transfer: "没有合适结果"
      })
    },
    fail: (res) => {},
  })
},

getPlaneInfo:function(id, trans, no) {
  var that = this;
  return new Promise(function (resolve, reject) {
    wx.request({
      url: utils.server_hostname + '/api/core/flights/getFlightInfo?flightid=' + id,
      success:function(res) {
        console.log(res.data)
        var lll = res.data[0];
        if (no == 1) {
          trans.t1_type = "飞机"
          trans.t1_number = lll.flightno
          trans.t1_date = lll.departdate
          trans.t1_time_start = lll.departtime.substring(0, 5)
          trans.t1_time_end = lll.arrivaltime
          trans.t1_station_start = lll.departport
          trans.t1_station_end = lll.arrivalport
          trans.selected = false
          trans.total_time = lll.departdate + " " + lll.departtime
          trans.transfer_time = lll.arrivaldate + " " + lll.arrivaltime
          trans.total_price = lll.minprice
          trans.t1_id = lll.id
          trans.t1_company = lll.airline
        }else if (no == 2) {
          trans.t2_type = "飞机"
          trans.t2_number = lll.flightno
          trans.t2_date = lll.arrivaldate
          trans.t2_time_start = lll.departtime
          trans.t2_time_end = lll.arrivaltime.substring(0, 5)
          trans.t2_station_start = lll.departport
          trans.t2_station_end = lll.arrivalport
          trans.total_price = (lll.minprice != 0 && trans.total_price != 0) ? lll.minprice + trans.total_price : 0
          trans.total_time = utils.calIntervalTime(trans.total_time, lll.arrivaldate + " " + lll.arrivaltime)
          trans.transfer_time = utils.calIntervalTime(trans.transfer_time, lll.departdate + " " + lll.departtime)
          trans.t2_id = lll.id
          trans.t2_company = lll.airline
        }    
        resolve();
      },
      fail:function(err){console.log(err);reject();}
    })
  });
},

getTrainInfo:function(id, trans, no) {
  var that = this;
  return new Promise(function (resolve, reject) {
    wx.request({
      url: utils.server_hostname + '/api/core/trains/getTrainInfo?id=' + id,
      success:function(res) {
        console.log(res.data)
        var lll = res.data[0];
        if (no == 1) {
          trans.t1_type = "火车"
          trans.t1_number = lll.trainno
          trans.t1_date = lll.departdate
          trans.t1_time_start = lll.departtime.substring(0, 5)
          trans.t1_time_end = lll.arrivaltime
          trans.t1_station_start = lll.station
          trans.t1_station_end = lll.endstation
          trans.selected = false
          trans.total_time = lll.departdate + " " + lll.departtime
          trans.transfer_time = lll.arrivaldate + " " + lll.arrivaltime
          var min = 10000
          for (let j in lll.prices) {
            if (lll.prices[j].price < min){min = lll.prices[j].price}
          }
          trans.total_price = (min == 10000) ? 0 : min
          trans.t1_id = lll.id
          trans.t1_company = lll.typename
        }else if (no == 2) {
          trans.t2_type = "火车"
          trans.t2_number = lll.trainno
          trans.t2_date = lll.arrivaldate
          trans.t2_time_start = lll.departtime
          trans.t2_time_end = lll.arrivaltime.substring(0, 5)
          trans.t2_station_start = lll.station
          trans.t2_station_end = lll.endstation
          var min = 10000
          for (let j in lll.prices) {
            if (lll.prices[j].price < min){min = lll.prices[j].price}
          }
          min = ((min == 10000) ? 0 : min)
          trans.total_price = (min != 0 && trans.total_price != 0) ? trans.total_price + min : 0 
          trans.total_time = utils.calIntervalTime(trans.total_time, lll.arrivaldate + " " + lll.arrivaltime)
          trans.transfer_time = utils.calIntervalTime(trans.transfer_time, lll.departdate + " " + lll.departtime)
          trans.t2_id = lll.id
          trans.t2_company = lll.typename
        }    
        resolve();
      },
      fail:function(err){console.log(err);reject();}
    })
  });
},

navigate2air: function(e) {
  var that = this
  //console.log(e)
  var index = e.currentTarget.dataset.index
  console.log(index)
  wx.navigateTo({
    url: '/pages/PlaneDetail/PlaneDetail?id=' + index,
  })
},

navigate2train: function(e) {
  var that = this
  //console.log(e)
  var index = e.currentTarget.dataset.index
  console.log(index)
  wx.navigateTo({
    url: '/pages/TrainDetail/TrainDetail?id=' + index,
  })
},

navigate2transfer: function(e) {
  var that = this
  console.log(e.currentTarget.dataset)
  var index = e.currentTarget.dataset
  var tmp = [{id:index.index1, type:index.type1}, {id:index.index2, type:index.type2}];
  wx.navigateTo({
    url: '/pages/ExchangeDetail/ExchangeDetail?idlist=' + JSON.stringify(tmp),
  })
},

  getCosttime: function(time) {
    var l = time.split(":");
    var ans = "";
    if (l[0] != "0" && l[0] != "00") ans += parseInt(l[0]) + "h";
    if (l[1] != "00") ans += parseInt(l[1]) + "min";
    return ans;
  },
})