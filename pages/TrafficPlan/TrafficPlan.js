// pages/TrafficPlan/TrafficPlan.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_hostname: utils.server_hostname,

    plans: [],
    hasPlans: false,

    postPlans: [],
    prePlans: [],
    hasPostPlans: false,
    hasPrePlans: false,

    compare_show: false,
    compare_num: 0,

    airplaneList: [],
    trainList: [],
    transferList: [],
    get_data_air: false,
    get_data_train: false,
    get_data_transfer: false
  },

  addZero: function(num) {
    if (parseInt(num) < 10) {
      num = "0" + num
    }
    return num;
  },
  
  getPlans: function() {
    console.log("getPlans")
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    
    wx.request({
      url: utils.server_hostname + '/api/core/plans/getMyPlan/',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {},

      success: function(res) {
        console.log(res)
        var hasPlans = (res.data.plan.length > 0) ? true : false
        var plans = res.data.plan
        for (let i in plans) {
          plans[i].key = i
        }
        that.setData({
          plans: res.data.plan,
          hasPlans: hasPlans
        })
        that.getPlansDetail()
      },
      fail: function(err) {
        console.log(err)
      }
    })
  },

  getPlansDetail: async function() {
    var that = this
    console.log("getPlansDetail")
    var oDate = new Date(),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oHour = oDate.getHours(),
        oMin = oDate.getMinutes(),
        oSen = oDate.getSeconds(),
        oTime = oYear + '-' + that.addZero(oMonth) + '-' + that.addZero(oDay) + ' ' +
                that.addZero(oHour) + ':' + that.addZero(oMin) + ':' + that.addZero(oSen)
    
    var plans = that.data.plans
    var prePlans = [],
        postPlans = []
    var airplaneList = [],
        trainList = [],
        transferList = []

    var index_list = 0
    var atrAsc = function (keyName) {
      return function (objectN, objectM) {
       var valueN = objectN[keyName]
       var valueM = objectM[keyName]
       if (valueN < valueM) return -1
       else if (valueN > valueM) return 1
       else return 0
      }
    }
    var atrDesc = function (keyName) {
      return function (objectN, objectM) {
       var valueN = objectN[keyName]
       var valueM = objectM[keyName]
       if (valueN < valueM) return 1
       else if (valueN > valueM) return -1
       else return 0
      }
    }
    
    for (let idx in plans) {
      var plan = JSON.parse(JSON.stringify(plans[idx]))
      console.log('plan'+idx+': '+plan.type+'-'+plan.type1)

      var plane = {
        type:'',
        comparetime:'',
        airline_Chinese:'',
        airline:'',
        flightno:'',
        departdate:'',
        departtime:'',
        arrivaltime:'',
        city:'',
        endcity:'',
        departport:'',
        arrivalport:'',
        minprice:0,
        selected:false,
        id:0
      }
      var train = {
        type:'',
        comparetime:'',
        train_company:'',
        train_number:'',
        train_date:'',
        train_time_start:'',
        train_time_end:'',
        train_city_start:'',
        train_city_end:'',
        train_station_start:'',
        train_station_end:'',
        train_price:0,
        selected:false,
        train_id:0
      }
      var trans = {
        type:'',
        comparetime:'',
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
      
      if (plan.type == '直达' && plan.type1 == '飞机') {
        await that.getDirectPlaneInfo(plan.id1, plane)

        airplaneList.push(JSON.parse(JSON.stringify(plane)))
        that.setData({
          airplaneList: airplaneList,
          get_data_air: true
        })
        if (plane.comparetime >= oTime) {
          postPlans.push(JSON.parse(JSON.stringify(plane)))
          postPlans.sort(atrAsc('comparetime'))
          that.setData({
            postPlans: postPlans,
            hasPostPlans: true
          })
        } else {
          prePlans.push(JSON.parse(JSON.stringify(plane)))
          prePlans.sort(atrDesc('comparetime'))
          that.setData({
            prePlans: prePlans,
            hasPrePlans: true
          })
        }
      } else if (plan.type == '直达' && plan.type1 == '火车') {
        await that.getDirectTrainInfo(plan.id1, train)

        trainList.push(JSON.parse(JSON.stringify(train)))
        that.setData({
          trainList: trainList,
          get_data_train: true
        })
        if (train.comparetime >= oTime) {
          postPlans.push(JSON.parse(JSON.stringify(train)))
          postPlans.sort(atrAsc('comparetime'))
          that.setData({
            postPlans: postPlans,
            hasPostPlans: true
          })
        } else {
          prePlans.push(JSON.parse(JSON.stringify(train)))
          prePlans.sort(atrDesc('comparetime'))
          that.setData({
            prePlans: prePlans,
            hasPrePlans: true
          })
        }
      } else if (plan.type == '换乘') {
        if (plan.id1 == "") {
          continue
        }

        if (plan.type1 == "火车") {
          await that.getTransTrainInfo(plan.id1, trans, 1);
        } else if (plan.type1 == "飞机") {
          await that.getTransPlaneInfo(plan.id1, trans, 1);
        }
        if (plan.type2 == "火车") {
          await that.getTransTrainInfo(plan.id2, trans, 2);
        } else if (plan.type2 == "飞机") {
          await that.getTransPlaneInfo(plan.id2, trans, 2);
        }
        index_list++

        transferList.push(JSON.parse(JSON.stringify(trans)))
        that.setData({
          transferList: transferList,
          get_data_transfer: true
        })
        if (trans.comparetime >= oTime) {
          postPlans.push(JSON.parse(JSON.stringify(trans)))
          postPlans.sort(atrAsc('comparetime'))
          that.setData({
            postPlans: postPlans,
            hasPostPlans: true
          })
        } else {
          prePlans.push(JSON.parse(JSON.stringify(trans)))
          prePlans.sort(atrDesc('comparetime'))
          that.setData({
            prePlans: prePlans,
            hasPrePlans: true
          })
        }
      }
    }
  },

  getDirectPlaneInfo: function(id, plane) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + '/api/core/flights/getFlightInfo',
        method: 'GET',
        data: {
          flightid: parseInt(id)
        },
        success: (result) => {
          // console.log(result.data)
          var lll = result.data[0]
          plane.type = '飞机'
          plane.airline_Chinese = lll.airline
          plane.airline = utils.airline_Chinese_to_number(lll.airline)
          plane.flightno = lll.flightno
          plane.departdate = lll.departdate
          plane.departtime = lll.departtime.substring(0, 5)
          plane.arrivaltime = lll.arrivaltime.substring(0, 5)
          plane.city = lll.city
          plane.endcity= lll.endcity
          plane.departport = lll.departport
          plane.arrivalport = lll.arrivalport
          plane.minprice = lll.minprice
          plane.selected = false
          plane.id = lll.id

          plane.comparetime = plane.departdate + ' ' + plane.departtime
          resolve()
        },
        fail:function(err){console.log(err);reject();}
      })
    });
  },

  getDirectTrainInfo: function(id, train) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + '/api/core/trains/getTrainInfo',
        method: 'GET',
        data: {
          id: parseInt(id)
        },
        success: (result) => {
          // console.log(result.data)
          var lll = result.data[0]
          train.type = '火车'
          train.typename = lll.typename
          train.trainno = lll.trainno
          train.departdate = lll.departdate
          train.departtime = lll.departtime.substring(0, 5)
          train.arrivaltime = lll.arrivaltime.substring(0, 5)
          train.startcity = lll.startcity
          train.endcity = lll.endcity
          train.station = lll.station
          train.endstation = lll.endstation
          train.selected = false
          train.id = lll.id
          var min = 10000
          for (let j in lll.prices) {
            if (lll.prices[j].price < min) {
              min = lll.prices[j].price
            }
          }
          train.train_price = (min == 10000) ? 0 : min

          train.comparetime = train.departdate + ' ' + train.departtime
          resolve()
        },
        fail:function(err){console.log(err);reject();}
      })
    });
  },

  getTransPlaneInfo: function(id, trans, no) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + '/api/core/flights/getFlightInfo?flightid=' + id,
        success:function(res) {
          console.log(res.data)
          var lll = res.data[0];
          if (no == 1) {
            trans.type = '换乘'

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

            trans.comparetime = trans.t1_date + ' ' + trans.t1_time_start
          } else if (no == 2) {
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
  
  getTransTrainInfo: function(id, trans, no) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + '/api/core/trains/getTrainInfo?id=' + id,
        success:function(res) {
          console.log(res.data)
          var lll = res.data[0];
          if (no == 1) {
            trans.type = '换乘'

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

            trans.comparetime = trans.t1_date + ' ' + trans.t1_time_start
          } else if (no == 2) {
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getPlans()
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
    console.log("onPullDownRefresh")
    wx.showNavigationBarLoading()
    this.getPlans()
    wx.showToast({
      title: '已刷新',
      duration: 1000
    });
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
    // console.log(this.data)
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
  
  navigate2air: function(e) {
    var that = this
    // console.log(e)
    var index = e.currentTarget.dataset.index
    console.log(index)
    wx.navigateTo({
      url: '/pages/PlaneDetail/PlaneDetail?id=' + index,
    })
  },
  
  navigate2train: function(e) {
    var that = this
    // console.log(e)
    var index = e.currentTarget.dataset.index
    console.log(index)
    wx.navigateTo({
      url: '/pages/TrainDetail/TrainDetail?id=' + index,
    })
  },
  
  navigate2transfer: function(e) {
    var that = this
    // console.log(e)
    var index = e.currentTarget.dataset
    console.log(index)
    var tmp = [{id:index.index1, type:index.type1}, {id:index.index2, type:index.type2}];
    wx.navigateTo({
      url: '/pages/ExchangeDetail/ExchangeDetail?idlist=' + JSON.stringify(tmp),
    })
  }
})