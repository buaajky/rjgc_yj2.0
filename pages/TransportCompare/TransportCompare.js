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
    plan1_minprice:-1,
    plan2_minprice:-1,
    plan1_exchange:"",
    plan2_exchange:"",
    lesstime:0,
    lessprice:0,
    lesstime_value:"",

    exchange_city1:"",
    exchange_city2:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    var tmp = JSON.parse(options.tmp); 
    console.log(tmp)
    var plan1 = [];
    var res1 = {
      departtime:"",
      arrivaltime:"",
      arrivaldt:"",
      costtime:"",
      minprice:0,
      exchange:""
    };
    that.getPlan(plan1, tmp.plan1, res1);
    var plan2 = [];
    var res2 ={
      departtime:"",
      arrivaltime:"",
      arrivaldt:"",
      costtime:"",
      minprice:0,
      exchange:""
    };
    that.getPlan(plan2, tmp.plan2, res2);
    console.log(res1)
    console.log(res2)
    that.setData({
      plan1:plan1,
      plan2:plan2,
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
    //为换乘补上中转城市
    if (plan1.length > 0 && plan1[0].arrivalcity == "") {
      that.getCity(plan1[0].arrivalport.split('站')[0]).then(
        function(data) {
          console.log(data)
          that.setData({
            exchange_city1:data.split("市")[0]
          })
        },
        function(err) {console.log(err)}
      )
    }
    if (plan2.length > 0 && plan2[0].arrivalcity == "") {
      that.getCity(plan2[0].arrivalport.split('站')[0]).then(
        function(data) {
          console.log(data)
          that.setData({
            exchange_city2:data.split("市")[0]
          })
        },
        function(err) {console.log(err)}
      )
    }
  },

  getPlan:async function(arr, source, ans) {
    var that = this;
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
      ans.departtime=source.departtime;
      ans.arrivaltime=that.getDate(source.arrivaldate) + " " + source.arrivaltime;
      ans.arrivaldt=source.arrivaldate + " " + source.arrivaltime + ":00";
      ans.costtime=source.costtime;
      ans.minprice=source.minpric;
      ans.exchange="直达";
      return;
    }else if (source.trainno != undefined) {//火车
      var tmp = {
        type:"t",
        no:source.trainno,
        company:source.typename,
        departport:source.departstation + '站',
        arrivalport:source.endstation + '站',
      };
      arr.push(tmp);
      ans.departtime=source.departtime;
      ans.arrivaltime=that.getDate(source.arrivaldate) + " " + source.arrivaltime;
      ans.arrivaldt=source.arrivaldate + " " + source.arrivaltime + ":00";
      ans.costtime=source.costtime;
      ans.minprice=source.train_price;
      ans.exchange="直达";
      return;
    }else {//换乘
      var tmp1 = {
        type:source.t1_type == '飞机'? 'a':'t',
        no:source.t1_number,
        company:source.t1_company,
        departport:source.t1_type == '飞机'?source.t1_station_start:source.t1_station_start + '站',
        arrivalport:source.t1_type == '飞机'?source.t1_station_end:source.t1_station_end + '站',
        arrivalcity:""
      };

      var tmp2 = {
        type:source.t2_type == '飞机'? 'a':'t',
        no:source.t2_number,
        company:source.t2_company,
        departport:source.t2_type == '飞机'?source.t2_station_start:source.t2_station_start + '站',
        arrivalport:source.t2_type == '飞机'?source.t2_station_end:source.t2_station_end + '站',
      };

      arr.push(tmp1);
      arr.push(tmp2);
      ans.departtime=source.t1_time_start;
      ans.arrivaltime=that.getDate(source.t2_date) + " " + source.t2_time_end;
      ans.arrivaldt=source.t2_date + " " + source.t2_time_end + ":00";
      ans.costtime=source.total_time;
      ans.minprice=source.total_price;
      ans.exchange="换乘约" + source.transfer_time;
      return;
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
    if (that.data.plan1_minprice == 0 || that.data.plan2_minprice == 0) return 0;

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
          resolve(address? address.address_components.city:"");
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