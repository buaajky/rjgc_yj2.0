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
    //todo
    var tmp = JSON.parse(options.tmp); 
    var plan1 = [];
    var res1 = that.getPlan(plan1, tmp.plan1);
    var plan2 = [];
    var res2 = that.getPlan(plan2, tmp.plan2);
    that.setData({
      departcity:tmp.startcity,
      arrivalcity:tmp.endcity,
      departdate:tmp.departdate,
      plan1_departtime:res1.departtime,
      plan2_departtime:res2.departtime,
      plan1_arrivaltime:res1.arrivaltime,
      plan2_arrivaltime:res2.arrivaltime,
      plan1_costtime:res1.costtime,
      plan2_costtime:res2.costtime,
      plan1_minprice:res1.minprice,
      plan2_minprice:res2.minprice,
      plan1_exchange:res1.exchange,
      plan2_exchange:res2.exchange,
      lesstime:that.cmpCosttime(tmp.departdate + " " + res1.departtime, res1.arrivaldt, tmp.departdate + " " + res2.departtime, res2.arrivaldt),
    });

    that.setData({
      lessprice:that.cmpMinPrice(),
    });
  },

  getPlan:async function(arr, source) {
    if (source.flightno != undefined) {//飞机
      var tmp = {
        type:"a",
        no:source.flightno,
        company:source.airline,
        departcity:source.city,
        arrivalcity:source.endcity,
        departport:source.departport,
        arrivalport:source.arrivalport,
      };
      arr.push(tmp);
      var res = {
        departtime:source.departtime,
        arrivaltime: that.getDate(source.arrivaldate) + " " + source.arrivaltime,
        arrivaldt:source.arrivaldate + " " + source.arrivaltime + ":00",
        costtime:source.costtime,
        minprice:source.minpric,
        exchange:"直达"
      };
      return res;
    }else if (source.trainno != undefined) {//火车
      var tmp = {
        type:"t",
        no:source.trainno,
        company:source.typename,
        departport:source.departstation + '站',
        arrivalport:source.arrivalstation + '站',
      };
      arr.push(tmp);
      var res = {
        departtime:source.departtime,
        arrivaltime: that.getDate(source.arrivaldate) + " " + source.arrivaltime,
        arrivaldt:source.arrivaldate + " " + source.arrivaltime + ":00",
        costtime:source.costtime,
        minprice:source.train_price,
        exchange:"直达"
      };
      return res;
    }else {//换乘
      var tmp1 = {
        type:source.t1_type == '飞机'? 'a':'t',
        no:source.t1_number,
        company:source.t1_company,//todo
        departport:source.t1_type == '飞机'?t1_station_start:t1_station_start + '站',
        arrivalport:source.t1_type == '飞机'?t1_station_end:t1_station_end + '站',
      };

      var tmp2 = {
        type:source.t2_type == '飞机'? 'a':'t',
        no:source.t2_number,
        company:source.t2_company,//todo
        departport:source.t2_type == '飞机'?t2_station_start:t2_station_start + '站',
        arrivalport:source.t2_type == '飞机'?t2_station_end:t2_station_end + '站',
      };
      //为第一个计划补上arrivalcity
      await that.getCity(tmp1.arrivalport).then(
        function(data){tmp1['arrivalcity'] = data.split("市")[0];},
        function(err) {tmp1['arrivalcity'] = '';}
      );

      arr.push(tmp1);
      arr.push(tmp2);
      var res = {
        departtime:source.t1_time_start,
        arrivaltime: that.getDate(source.t2_date) + " " + source.t2_time_end,
        arrivaldt:source.t2_date + " " + source.t2_time_end + ":00",
        costtime:source.total_time,
        minprice:source.total_price,
        exchange:"换乘约" + source.transfer_time
      };
      return res;
    }
  },

  getDate: function (d) {
    var tmp = d.split("-");
    return tmp[1] + "-" + tmp[2];
  },

  getTime: function (d) {
    var tmp = d.split(":");
    return tmp[0] + ":" + tmp[1];
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

  cmpMinPrice: function() {
    var that = this;
    if (that.data.plan1_minprice > that.data.plan2_minprice) return 2;
    else if (that.data.plan1_minprice < that.data.plan2_minprice) return 1;
    return 0;
  },

  getCity:function(port) {
    var apiUrl = "https://apis.map.qq.com/ws/geocoder/v1/?address=";
    var getLocationUrl = apiUrl + port + "&key=" + utils.subkey;
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