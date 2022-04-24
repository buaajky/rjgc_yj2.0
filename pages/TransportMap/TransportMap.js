const { server_imagename } = require("../../utils/util.js");
// pages/TransportMap/TransportMap.js
const utils = require("../../utils/util.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,

    server_hostname: utils.server_hostname,
    server_imagename: server_imagename,

    longitude:null,
    latitude:null,

    plans:[
      {
        type:"t",
        city1:"重庆",
        city2:"北京",
        port1:"杭州东站",
        port2:"北京西站",
      },
      {
        type:"a",
        city1:"北京",
        city2:"哈尔滨",
        port1:"首都国际机场",
        port2:"浦东国际机场",
      }
    ],
    markers: [],
    polyline:[],
    scale:4,
    rainbow_list:[
      "#3232CDDD",
      "#4D4DFFDD",
      "#007FFFDD",
      "#33C9FFDD",
      "#38B0DEDD"
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    var that = this;
    var points = []
    var lines = []
    var plans = JSON.parse(options.plans);

    //adding city
    await that.getLngLat(plans[0].city1, plans[0].port1, "", 0, points, true, false);
    for (var i = 0; i < plans.length; i++) {
        await that.getLngLat(plans[i].city2, plans[i].port2,
          i + 1 < plans.length? plans[i+1].port1 :"",
          i + 1, points, false, i == plans.length - 1);
    }

    //adding route
    // var scale = Math.ceil(points.length / that.data.rainbow_list.length);
    var lngsum = 0.0;
    var latsum = 0.0;
    var pl = points.length - 1;
    for (var i = 0; i < pl; i++) {
      lngsum += points[i].longitude;
      latsum += points[i].latitude;
      var poly = {
        points:[
           {
            longitude: points[i].longitude,
             latitude: points[i].latitude
          },
           {
            longitude: points[i + 1].longitude,
            latitude: points[i + 1].latitude
           }
          ],
        // color: that.data.rainbow_list[Math.floor(i / scale)],
        color:"#3963bc",
        width:5,
        arrowLine:true,
      };
      lines.push(poly);
      var rotate = -360*Math.atan((points[i+1].latitude - points[i].latitude)/(points[i+1].longitude - points[i].longitude))/(2*Math.PI);
      if (rotate > 60) rotate = 60;
      if (rotate < -60) rotate = -60;

      console.log(rotate);
      var left = points[i+1].longitude < points[i].longitude? 1: -1;
      var side;//图片在线的左边
      if (points[i+1].latitude > points[i].latitude) {
        side = points[i].longitude < points[i+1].longitude? 1:-1;
      }else {
        side = points[i+1].longitude < points[i].longitude? 1:-1;
      }
      var icon = "";
      switch(plans[i].type) {
        case "a":
          icon = left == 1? '/images/map_plane_left.png':'/images/map_plane_right.png';
          break;
        case "t":
          icon = left == 1? '/images/map_train_left.png':'/images/map_train_right.png';
          break;
      }

      var tool = {
          longitude: (points[i].longitude + points[i + 1].longitude)/2 + 1.5*side,
          latitude: (points[i].latitude + points[i + 1].latitude)/2,
          width: 180 - 40 * pl,
          height: 180 - 40 * pl,
          rotate:rotate,
          id: pl + 1 +i,
          iconPath: icon,
      };
      points.push(tool);
    }

    that.setData({
      markers:points,
      polyline:lines,
      longitude:(lngsum + points[pl].longitude)/(pl+1),
      latitude:(latsum + points[pl].latitude)/(pl+1),
      scale: 7 - pl,
      plans:plans//可以不存
    })
    // console.log(that.data)

  },

  getLngLat:function(city, port, nextport, index, arr, start, end) {
    var apiUrl = "https://apis.map.qq.com/ws/geocoder/v1/?address=";
    var getLocationUrl = apiUrl + city + "市" + "&key=" + utils.subkey;
    return new Promise(function (resolve, reject) {
      wx.request({        
        url: getLocationUrl,
        success: function (res) {
          console.log(res)   
          var address = res.data.result;
          var content = "";
          if (start) {
            content = "始发地点：" + address.address_components.city + " · "+ port;
          }else if (end) {
            content = "抵达终点：" + address.address_components.city + " · "+ port;
          }else {//exchange
            if (nextport == port) {
              content = "抵达：" + port + "\n" + "同站换乘";
            }else {
              content = "抵达：" + port + "\n" + "换乘前往：" + nextport;
            }
          }
          arr.push({
            longitude: address.location.lng,
            latitude: address.location.lat,
            // label: {
            //   content: address.address_components.city,
            //   fontSize:15,
            //   color:"#32cd32",
            //   bgColor:"#00000000"
            // },
            id:index,
            width:20,
            height:25,
            callout:{
              content: content,
              fontSize:14,
              color:"#ffffff",
              // bgColor:"#00000000" //transparent
              bgColor:"#3963bc",
              borderColor:"#3963bc",
              borderRadius: 10,
              borderWidth:2,
              padding:2,
            }
          });
          console.log("here"+city);
          resolve();
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