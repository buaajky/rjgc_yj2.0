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
        // console.log(res)
        var hasPlans = (res.data.length > 0) ? true : false
        var plans = res.data
        for (let i in plans) {
          plans[i].key = i
        }
        that.setData({
          plans: res.data,
          hasPlans: hasPlans
        })
        that.getPlansDetail()
      },
      fail: function(err) {
        console.log(err)
      }
    })
  },

  getPlansDetail: function() {
    console.log("getPlansDetail")
    var oDate = new Date(),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oTime = oYear + '-' + this.addZero(oMonth) + '-' + this.addZero(oDay)
    
    var that = this
    var plans = that.data.plans
    var prePlans = [],
        postPlans = []
    var airplaneList = [],
        trainList = [],
        transferList = []

    var index_list = 0
    
    for (let idx in plans) {
      var plan = JSON.parse(JSON.stringify(plans[idx]))
      console.log('plan'+idx+': '+plan.type+'-'+plan.type1)

      var plane = {
        type:'',
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
        wx.request({
          url: utils.server_hostname + '/api/core/flights/getFlightInfo',
          method: 'GET',
          data: {
            flightid: parseInt(plan.id1)
          },
          success: (result) => {
            // console.log(result.data)
            var lll = result.data[0]
            plane.type = '飞机'
            plane.airline = lll.airline
            plane.flightno = lll.flightno
            plane.departdate = lll.departdate
            plane.departtime= lll.departtime.substring(0, 5)
            plane.arrivaltime = lll.arrivaltime.substring(0, 5)
            plane.city = lll.city
            plane.endcity= lll.endcity
            plane.departport = lll.departport
            plane.arrivalport = lll.arrivalport
            plane.minprice = lll.minprice
            plane.selected = false
            plane.id = lll.id

            airplaneList.push(JSON.parse(JSON.stringify(plane)))
            that.setData({
              airplaneList: airplaneList,
              get_data_air: true
            })
            if (plane.departdate >= oTime) {
              postPlans.push(JSON.parse(JSON.stringify(plane)))
              that.setData({
                postPlans: postPlans,
                hasPostPlans: true
              })
            } else {
              prePlans.push(JSON.parse(JSON.stringify(plane)))
              that.setData({
                prePlans: prePlans,
                hasPrePlans: true
              })
            }
          },
          fail: (res) => {},
        })
      } else if (plan.type == '直达' && plan.type1 == '火车') {
        wx.request({
          url: utils.server_hostname + '/api/core/trains/getTrainInfo',
          method: 'GET',
          data: {
            id: plan.id1
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
            
            trainList.push(JSON.parse(JSON.stringify(train)))
            that.setData({
              trainList: trainList,
              get_data_train: true
            })
            if (train.departdate >= oTime) {
              postPlans.push(JSON.parse(JSON.stringify(train)))
              that.setData({
                postPlans: postPlans,
                hasPostPlans: true
              })
            } else {
              prePlans.push(JSON.parse(JSON.stringify(train)))
              that.setData({
                prePlans: prePlans,
                hasPrePlans: true
              })
            }
          },
          fail: (res) => {},
        })
      } else if (plan.type == '换乘') {
        if (plan.type1 == '火车') {
          wx.request({
            url: utils.server_hostname + '/api/core/trains/getTrainInfo',
            method: 'GET',
            data: {
              id: parseInt(plan.id1)
            },
            success: (result) => {
              // console.log(result.data)
              var lll = result.data[0]
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
            },
            fail: (res) => {},
          })
        } else if (plan.type1 == '飞机') {
          wx.request({
            url: utils.server_hostname + '/api/core/flights/getFlightInfo',
            method: 'GET',
            data: {
              flightid: parseInt(plan.id1)
            },
            success: (result) => {
              // console.log(result.data)
              var lll = result.data[0]
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
            },
            fail: (res) => {},
          })
        }
        if (plan.type2 == '火车') {
          wx.request({
            url: utils.server_hostname + '/api/core/trains/getTrainInfo',
            method: 'GET',
            data: {
              id: parseInt(plan.id2)
            },
            success: (result) => {
              var lll = result.data[0]
              trans.type = '换乘'
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
              trans.total_price +=  ((min == 10000) ? 0 : min)
              trans.total_time = utils.calIntervalTime(trans.total_time, lll.arrivaldate + " " + lll.arrivaltime)
              trans.transfer_time = utils.calIntervalTime(trans.transfer_time, lll.departdate + " " + lll.departtime)
              trans.t2_id = lll.id
              trans.t2_company = lll.typename
              index_list++

              transferList.push(JSON.parse(JSON.stringify(trans)))
              that.setData({
                transferList: transferList,
                get_data_transfer: true
              })
              if (trans.t1_date >= oTime) {
                postPlans.push(JSON.parse(JSON.stringify(trans)))
                that.setData({
                  postPlans: postPlans,
                  hasPostPlans: true
                })
              } else {
                prePlans.push(JSON.parse(JSON.stringify(trans)))
                that.setData({
                  prePlans: prePlans,
                  hasPrePlans: true
                })
              }
            },
            fail: (res) => {},
          })
        } else if (plan.type2 == '飞机') {
          wx.request({
            url: utils.server_hostname + '/api/core/flights/getFlightInfo',
            method: 'GET',
            data: {
              flightid: parseInt(plan.id2)
            },
            success: (result) => {
              var lll = result.data[0]
              trans.type = '换乘'
              trans.t2_type = "飞机"
              trans.t2_number = lll.flightno
              trans.t2_date = lll.arrivaldate
              trans.t2_time_start = lll.departtime
              trans.t2_time_end = lll.arrivaltime.substring(0, 5)
              trans.t2_station_start = lll.departport
              trans.t2_station_end = lll.arrivalport
              trans.total_price += lll.minprice
              trans.total_time = utils.calIntervalTime(trans.total_time, lll.arrivaldate + " " + lll.arrivaltime)
              trans.transfer_time = utils.calIntervalTime(trans.transfer_time, lll.departdate + " " + lll.departtime)
              trans.t2_id = lll.id
              trans.t2_company = lll.airline
              index_list++
              
              transferList.push(JSON.parse(JSON.stringify(trans)))
              that.setData({
                transferList: transferList,
                get_data_transfer: true
              })
              if (trans.t1_date >= oTime) {
                postPlans.push(JSON.parse(JSON.stringify(trans)))
                that.setData({
                  postPlans: postPlans,
                  hasPostPlans: true
                })
              } else {
                prePlans.push(JSON.parse(JSON.stringify(trans)))
                that.setData({
                  prePlans: prePlans,
                  hasPrePlans: true
                })
              }
            },
            fail: (res) => {},
          })
        }
      }
    }
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
    console.log(this.data)
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

  // selectList_airplane(e) {
  //   const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
  //   let tmp = this.data.airplaneList;                    // 获取购物车列表
  //   const selected = tmp[index].selected;         // 获取当前商品的选中状态
  //   tmp[index].selected = !selected;              // 改变状态
  //   this.setData({
  //     airplaneList: tmp,
  //     compare_num: tmp[index].selected ? this.data.compare_num + 1 : this.data.compare_num - 1
  //   });
  // },

  // selectList_train(e) {
  //   const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
  //   let tmp = this.data.trainList;                    // 获取购物车列表
  //   const selected = tmp[index].selected;         // 获取当前商品的选中状态
  //   tmp[index].selected = !selected;              // 改变状态
  //   this.setData({
  //     trainList: tmp,
  //     compare_num: tmp[index].selected ? this.data.compare_num + 1 : this.data.compare_num - 1
  //   });
  // },

  // selectList_transfer(e) {
  //   const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
  //   let tmp = this.data.transferList;                    // 获取购物车列表
  //   const selected = tmp[index].selected;         // 获取当前商品的选中状态
  //   tmp[index].selected = !selected;              // 改变状态
  //   this.setData({
  //     transferList: tmp,
  //     compare_num: tmp[index].selected ? this.data.compare_num + 1 : this.data.compare_num - 1
  //   });
  // },

  // compare_ready(e) {
  //   var self = this;
  //   self.setData({
  //     compare_show: !self.data.compare_show
  //   })
  // },
  
  // compare_cancel(e) {
  //   var self = this;
  //   var tmp1 = self.data.airplaneList;
  //   var tmp2 = self.data.trainList;
  //   var tmp3 = self.data.transferList;
  //   for (var i in tmp1) {
  //     tmp1[i].selected = false;
  //   }
  //   for (var i in tmp2) {
  //     tmp2[i].selected = false;
  //   }
  //   for (var i in tmp3) {
  //     tmp3[i].selected = false;
  //   }
  //   self.setData({
  //     compare_show: !self.data.compare_show,
  //     airplaneList: tmp1,
  //     trainList: tmp2,
  //     transferList: tmp3
  //   })
  // },
  
  // compare_do: function(e) {
  //   var that = this
  //   var tmp = []
  //   if (that.data.compare_num != 2) {
  //     wx.showToast({
  //       title: "请选择2个交通方案",
  //       icon: 'error'
  //     })
  //   }
  //   else {
  //     for (let i in that.data.airplaneList) {
  //       if (that.data.airplaneList[i].selected) {
  //         var item = {
  
  //         flightno: that.data.airplaneList[i].flightno,
  //         airline: that.data.airplaneList[i].airline,
  //         city: that.data.airplaneList[i].city,
  //         endcity: that.data.airplaneList[i].endcity,
  //         departport: that.data.airplaneList[i].departport,
  //         arrivalport: that.data.airplaneList[i].arrivalport,
  //         departdate: that.data.airplaneList[i].departdate,
  //         departtime: that.data.airplaneList[i].departtime,
  //         arrivaldate: that.data.airplaneList[i].arrivaldate,
  //         arrivaltime: that.data.airplaneList[i].arrivaltime,
  //         costtime: that.data.airplaneList[i].costtime,
  //         minpric: that.data.airplaneList[i].minprice
  //         }
  //         tmp.push(item)
  //       }
  //     }
  //     for (let i in that.data.trainList) {
  //       if (that.data.trainList[i].selected) {
  //         var item = {
  
  //           trainno: that.data.trainList[i].trainno,
  //           typename: that.data.trainList[i].typename,
  //           departstation: that.data.trainList[i].departstation,
  //           endstation: that.data.trainList[i].endstation,
  //           departdate: that.data.trainList[i].departdate,
  //           departtime: that.data.trainList[i].departtime,
  //           arrivaldate: that.data.trainList[i].arrivaldate,
  //           arrivaltime: that.data.trainList[i].arrivaltime,
  //           costtime: that.data.trainList[i].costtime,
  //           train_price: that.data.trainList[i].train_price
  //           }
  //         tmp.push(item)
  //       }
  //     }
  //     for (let i in that.data.transferList) {
  //       if (that.data.transferList[i].selected) {
  //         var item = {
  //           t1_type:that.data.transferList[i].t1_type,
  //           t1_number:that.data.transferList[i].t1_number,
  //           t1_date:that.data.transferList[i].t1_date,
  //           t1_time_start:that.data.transferList[i].t1_time_start,
  //           t1_time_end:that.data.transferList[i].t1_time_end,
  //           t1_station_start:that.data.transferList[i].t1_station_start,
  //           t1_station_end:that.data.transferList[i].t1_station_start,
  //           t2_type:that.data.transferList[i].t2_type,
  //           t2_number:that.data.transferList[i].t2_number,
  //           t2_date:that.data.transferList[i].t2_date,
  //           t2_time_start:that.data.transferList[i].t2_time_start,
  //           t2_time_end:that.data.transferList[i].t2_time_end,
  //           t2_station_start:that.data.transferList[i].t2_station_start,
  //           t2_station_end:that.data.transferList[i].t2_station_end,
  //           total_price:that.data.transferList[i].total_price,
  //           total_time:that.data.transferList[i].total_time,
  //           transfer_time:that.data.transferList[i].transfer_time,
  //         }
  //         tmp.push(item)
  //       }
  //     }
  //     console.log(tmp)
  //   }
  // },
  
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