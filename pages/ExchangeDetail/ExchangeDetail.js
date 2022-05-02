const { server_imagename } = require("../../utils/util.js");
// pages/ExchangeDetail/ExchangeDetail.js
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
    startcity:"北京",
    endcity:"广州",
    costtime:"9h23min",

    plans: [
      // {
      //   type:"a",
      //   id:1,
      //   toolname:"东航MU2452",
      //   departdate:"2022-04-24",
      //   day:0,
      //   departtime:"11:40",
      //   arrivaltime:"14:10",
      //   departcity:"北京",
      //   arrivalcity:"武汉",
      //   departport:"大兴国际机场",
      //   arrivalport:"天河机场 T3",
      //   costtime:"2h30min",
      //   money:780
      // },
      // {
      //   type:"t",
      //   toolname:"高铁G2055",
      //   departdate:"2022-04-24",
      //   day:0,
      //   departtime:"16:43",
      //   arrivaltime:"21:03",
      //   departcity:"武汉",
      //   arrivalcity:"广州",
      //   departport:"武汉",
      //   arrivalport:"广州南",
      //   costtime:"4h20min",
      //   money:538.5
      // }
    ],

    //交互控制
    showNotice:false,//是否显示完整的通知（半屏弹窗）
    hastrain:false//是否显示12306
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

  navigate2detail: function(e) {//跳转到详情页
    //console.log(this.data.plans[parseInt(e.target.id)])
    var tmp = this.data.plans[parseInt(e.target.id)];
    if (tmp.type == 'a') {
      wx.navigateTo({
        url: '/pages/PlaneDetail/PlaneDetail?id=' + tmp.id,
      })
    }else if (tmp.type == 't') {
      wx.navigateTo({
        url: '/pages/TrainDetail/TrainDetail?id=' + tmp.id + "&city=" + tmp.departcity + "&endcity="+ tmp.arrivalcity,
      })
    }
  },

  navigateTo12306:function() {
    wx.navigateTo({
      url: '/pages/12306/12306',
    })
  },

  navigate2map: function() {//在地图上查看
    var that = this;
    var tmp = [];
    for(var i in that.data.plans) {
      var extra = "";
      if (that.data.plans[i].type == "t") extra = "站";
      tmp.push({
        type: that.data.plans[i].type,
        city1: that.data.plans[i].departcity== ""?that.data.plans[i].departport.split(' ')[0] + extra:that.data.plans[i].departcity,
        city2: that.data.plans[i].arrivalcity== ""? that.data.plans[i].arrivalport.split(' ')[0] + extra: that.data.plans[i].arrivalcity,
        port1: that.data.plans[i].departport.split(' ')[0] + extra,
        port2: that.data.plans[i].arrivalport.split(' ')[0] + extra,
      })
    }

    wx.navigateTo({
      url: '/pages/TransportMap/TransportMap?plans=' + JSON.stringify(tmp),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show
    });

    // console.log(options)
    var that = this;
    //todo:
    var idlist = options.idlist? options.idlist: [{id:2, type:'火车'}, {id:74, type:"火车"}];

    var plan = [];
    for (var i = 0; i < idlist.length; i++) {
      if (idlist[i].type == '飞机') {
        await that.getPlaneInfo(plan, idlist[i].id);
      }else if (idlist[i].type == '火车') {
        await that.getTrainInfo(plan, idlist[i].id); 
      }
    }

    that.setData({
      plans:plan,
      startcity:plan[0].departcity,
      endcity:plan[plan.length-1].arrivalcity,
      departdate:plan[0].departdate,
      departweek: utils.getWeekByDate(plan[0].departdate),
      costtime:utils.calIntervalTime(plan[0].departdate + " " + plan[0].departtime, plan[plan.length-1].arrivaldate + " " + plan[plan.length-1].arrivaltime)
    })

    that.calHasTrain(plan);
    that.getNoticeBar(plan[plan.length-1].arrivalcity);//获取抵达城市防疫公告
  },

  getPlaneInfo:function(arr, id) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + '/api/core/flights/getFlightInfo?flightid=' + id,
        success:function(res) {
          var tmp = res.data[0];
          var p = {
            type:"a",
            id:id,
            toolname:tmp.airline + tmp.flightno,
            departdate:tmp.departdate,
            arrivaldate:tmp.arrivaldate,
            day:that.calDay(tmp.departdate, tmp.arrivaldate),
            departtime:that.getTime(tmp.departtime),
            arrivaltime:that.getTime(tmp.arrivaltime),
            departcity:tmp.city,
            arrivalcity:tmp.endcity,
            departport:tmp.departport + " " + tmp.departterminal,
            arrivalport:tmp.arrivalport + " " + tmp.arrivalterminal,
            costtime:utils.calIntervalTime(tmp.departdate + " " + tmp.departtime, tmp.arrivaldate + " " + tmp.arrivaltime),
          };

          //计算最小价格
          wx.request({
            url: utils.server_hostname + '/api/core/flights/getPriceList?id=' + id,
            success:function(res) {
              var list = res.data;
              var mm = 0.0;
              if (list.length > 0) {
                mm = list[0].price;
                for (var i in list) {
                  if (list[i].price < mm) mm = list[i].price;
                }
              }         
              p["money"] = mm;
              arr.push(p);
              resolve();
            },
            fail:function(err) {
              console.log(err);
              reject();
            }
          });
        },
        fail:function(err) {
          console.log(err);
          reject();
        }
      })
    })
  },

  getTrainInfo:function(arr, id) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + '/api/core/trains/getTrainInfo?id=' + id,
        success:async function(res) {
          //console.log(res)
          var tmp = res.data[0];
          var city;
          var endcity;
          await that.getCity(tmp.station).then(
            function(data){city = data.split("市")[0]},
            function(err){console.log(err)}
          );
          await that.getCity(tmp.endstation).then(
            function(data){endcity = data.split("市")[0]},
            function(err){console.log(err)}
          );

          var p = {
            type:"t",
            id:id,
            toolname:tmp.typename + tmp.trainno,
            departdate:tmp.departdate,
            arrivaldate:tmp.arrivaldate,
            day:that.calDay(tmp.departdate, tmp.arrivaldate),
            departtime:that.getTime(tmp.departtime),
            arrivaltime:that.getTime(tmp.arrivaltime),
            departcity:city,
            arrivalcity:endcity,
            departport:tmp.station,
            arrivalport:tmp.endstation,
            costtime:utils.calIntervalTime(tmp.departdate + " " + tmp.departtime, tmp.arrivaldate + " " + tmp.arrivaltime),
            money:tmp.prices.sort((a, b) => {return a.price - b.price})[0].price,
          };
          arr.push(p);
          resolve();
        },
        fail:function(err) {
          console.log(err);
          reject();
        }
      })
    });
  },

  getCity:function(port) {
    var apiUrl = "https://apis.map.qq.com/ws/geocoder/v1/?address=";
    var getLocationUrl = apiUrl + port + "站" + "&key=" + utils.subkey;
    return new Promise(function (resolve, reject) {
      wx.request({        
        url: getLocationUrl,
        success: function (res) {
          console.log(res)   
          var address = res.data.result;
          resolve(address.address_components.city);
        },
        fail: function(res) { console.log(res); reject();}
      })
    }
    )
  },

  getTime: function(time) {
    var l = time.split(":");
    return l[0] + ":" + l[1];
  },

  calDay: function(d1, d2) {//计算day
    var that = this
    var d = new Date(d1.replace(/-/g, "/") + " 00:00:00")
    var a = new Date(d2.replace(/-/g, "/") + " 00:00:00")
    var day = parseInt((a.getTime() - d.getTime())/(1000 * 60 * 60 *24))
    return day;
  },

  calHasTrain:function(plans) {
    var that = this;
    for (let item of plans) {
      if (item.type == 't') {
        that.setData({
          hastrain:true
        })
        break;
      }
    }
  },

  getNoticeBar(city){
    var that = this;
    wx.request({
      url: utils.server_hostname + '/api/core/epidemicInfo/getInfo?position=' + city + '市',
      success:function(res) {
        var tmp = " 暂无防疫信息";
        if (res.data.length > 0) tmp = res.data[0].description
        that.setData({
          notice: tmp,
        });
      },
      fail:function(err) {
        console.log(err);
      }
    })
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