// pages/footprint/footprint.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,

    // rainbow_list:[
    //   "#3232CDDD",
    //   "#4D4DFFDD",
    //   "#007FFFDD",
    //   "#33C9FFDD",
    //   "#38B0DEDD"
    // ],

    linecolor_map:{
      "飞机": "#007FFFDD",
      "火车": "#7bcfa6",
    },

    lineicon_map:{
      "飞机": "/images/map_plane_right.png",
      "火车": "/images/map_train_right.png",
    },

    today:"",

    longitude:null,
    latitude:null,
    
    markers:[],
    polyline:[],

    next:"init",

    id:"",
    nickname:"",
    icon:"",
    cities:"",
    travels:"",
    isMine: false,

    southest_city:"",
    northest_city:"",

    recommend_0:"",
    recommend_1:"",
    recommend_2:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)

    this.setData({
      id: options.id,
      nickname: options.nickname,
      icon: options.icon,
      cities: options.cities,
      travels: options.travels,
      isMine: options.id == wx.getStorageSync('id'),
      today: utils.formatTime(new Date()).split(" ")[0].replace(/\//g, "-")
    })

    console.log(this.data.today)

    this.getFootprint()
  },

  getFootprint: function() {
    wx.showLoading({
      title: '正在生成足迹'
    })
    var that = this
    var url
    if (that.data.next == "init") {
      url = utils.server_hostname + '/api/core/travels/positions/?id=' + that.data.id
    } else {
      url = that.data.next
    }

    if (url == null) {
      wx.showToast({
        title: "没有更多足迹啦",
        icon: "none",
        duration: 1000
      })
      return
    }

    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')

    wx.request({
      url: url,
      data: {
      },
      method: 'GET',
      header: {
      'content-type': 'application/json',
      'token-auth': token
      },
      success: function(res) {
        // console.log(res);
        // loginExpired?
        
        that.setData({
          next: res.data.next
        })

        var travel_list = res.data.results

        var markers = that.data.markers
        for (var i in travel_list) {
          var travel = travel_list[i]
          console.log(travel);
          
          var marker = {
            id: parseInt(i),    
            longitude: travel.position.longitude,
            latitude: travel.position.latitude,
            iconPath:'/images/footprint_point.png',
            height:35,
            width:35,
            callout:{
              content: travel.position.name == "" ? travel.position.city:travel.position.city + " · " + travel.position.name,
              fontSize:14,
              color:"#ffffff",
              bgColor:"#3963bc",
              borderColor:"#3963bc",
              borderRadius: 10,
              borderWidth:2,
              padding:2,
            }
          }
          markers.push(marker)
        }

        var polyline = []
        // var scale = Math.ceil(markers.length / that.data.rainbow_list.length)
        // for (var i = 0; i < markers.length - 1; i++) {
        //   var poly = {
        //     points:[
        //       {
        //         longitude: markers[i].longitude,
        //         latitude: markers[i].latitude
        //       },
        //       {
        //         longitude: markers[i + 1].longitude,
        //         latitude: markers[i + 1].latitude
        //       }
        //     ],
        //     color: that.data.rainbow_list[Math.floor(i / scale)],
        //     width:10
        //   }
        //   polyline.push(poly)
        // }

        //get plans
        wx.request({
          url: utils.server_hostname + '/api/core/plans/getMyPlan/',
          method: 'GET',
          header: {
          'content-type': 'application/json',
          'token-auth': token
          },
          success:async function(res) {
            console.log(res.data);
            var plans = res.data;
            var prel = markers.length;
            for (var i in plans) {
              if (markers.length - prel == 4) {//腾讯地图api一秒内不允许访问过多次
                await that.sleep(1000);
                prel = markers.length;
              }
              
              await that.plan2line(plans[i].type1, plans[i].id1, plans[i].from1, plans[i].to1, markers, polyline);
              
              if (plans[i].type == "换乘") {
                if (markers.length - prel == 4) {//腾讯地图api一秒内不允许访问过多次
                  await that.sleep(1000);
                  prel = markers.length;
                }
                await that.plan2line(plans[i].type2, plans[i].id2, plans[i].from2, plans[i].to2, markers, polyline);
              }
            }

            that.setData({
              markers: markers,
              polyline: polyline,
              longitude: (markers.length > 0)? markers[0].longitude : null,
              latitude: (markers.length > 0)? markers[0].latitude : null
            })
    
            console.log(that.data)
            that.analyseFootprint()
            wx.hideLoading({
              success: (res) => {},
            });
          },
          fail:function(err) {
            console.log(err);
            that.setData({
              markers: markers,
              polyline: polyline,
              longitude: (markers.length > 0)? markers[0].longitude : null,
              latitude: (markers.length > 0)? markers[0].latitude : null
            })
    
            // console.log(that.data)
            that.analyseFootprint()
          }
        })
      },
      fail: function(res) { console.log(res); }
    })
  },

  sleep:function(time){
    console.log("sleep")
    return new Promise(function(resolve){
    setTimeout(resolve, time);
    });
   },

  plan2line:function(type, id, city1, city2, arr_p, arr_l) {
    var that = this;
    var line = {
      points:[
              {
                longitude: null,
                latitude: null
              },
              {
                longitude: null,
                latitude: null
              }
      ],
      color: that.data.linecolor_map[type],
      width:2.5,
      arrowLine:true,
    }

    var url = type == "飞机" ? '/api/core/flights/getFlightInfo?flightid=': '/api/core/trains/getTrainInfo?id=';
    return new Promise (function (resolve, reject) {
      wx.request({
        url: utils.server_hostname + url + id,
        success: async function(res) {
          if (res.data[0].departdate < that.data.today) {
            await that.getLngLat(city1, arr_p).then(
              function(data) {
                console.log(data)
                line.points[0].longitude = data.lng;
                line.points[0].latitude = data.lat;
              },
              function(err) {console.log(err)}
            );
        
            await that.getLngLat(city2, arr_p).then(
              function(data) {
                console.log(data)
                line.points[1].longitude = data.lng;
                line.points[1].latitude = data.lat;
              },
              function(err) {console.log(err)}
            );
            
            arr_l.push(line);
            resolve();
            return;
          }
          resolve();        
        },
        fail:function(err) {
          console.log(err);
          reject();
        }
      })

    })
  },

  getLngLat:function(city, arr) {//获取城市经纬度
    var apiUrl = "https://apis.map.qq.com/ws/geocoder/v1/?address=";
    var getLocationUrl = apiUrl + city + "市" + "&key=" + utils.subkey;
    return new Promise(function (resolve, reject) {
      wx.request({        
        url: getLocationUrl,
        success: function (res) {
          console.log(res)   
          var address = res.data.result;
          arr.push({
            longitude: address.location.lng,
            latitude: address.location.lat,
            id:arr.length,
            iconPath:'/images/footprint_point.png',
            width:20,
            height:20,
            callout:{
              content: city,
              fontSize:14,
              color:"#ffffff",
              bgColor:"#3963bc",
              borderColor:"#3963bc",
              borderRadius: 10,
              borderWidth:2,
              padding:2,
            }
          });
          resolve({lng:address.location.lng, lat:address.location.lat});
        },
        fail: function(res) { console.log(res); reject();}
      })
    }
    )
  },

  analyseFootprint:function() {
    var markers = this.data.markers
    if (markers.length == 0) return
    var southest = markers[0].latitude
    var northest = markers[0].latitude
    var southest_city = markers[0].callout.content
    var northest_city = markers[0].callout.content
    for (var i in markers) {
      var marker = markers[i]
      if (marker.latitude < southest) {
        southest = marker.latitude
        southest_city = marker.callout.content
      }
      if (marker.latitude > northest) {
        northest = marker.latitude
        northest_city = marker.callout.content
      }
    }

    this.setData({
      southest_city: southest_city,
      northest_city: northest_city
    })

    var that = this
    if (that.data.isMine) {
      var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
      wx.request({
        url: utils.server_hostname + "/api/core/position/recommend/",
        data: {
        },
        method: 'GET',
        header: {
        'content-type': 'application/json',
        'token-auth': token
        },
        success: function(res) {
          // console.log(res);
          var loclist = res.data.data
  
          for (var i in loclist) {
            var loc = loclist[i]
            // console.log(loc)

            var latitude = loc.latitude
            var longitude = loc.longitude
            that.getRecommend(i, latitude, longitude)
          }
          // console.log(that.data)
        },
        fail: function(res) { console.log(res); }
      })
    }
  },

  getRecommend: function(index, latitude, longitude) {
    var that = this
    var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
    + latitude + "," + longitude + "&key=" + utils.subkey;
    wx.request({        
      url: getAddressUrl,
      success: function (address) {   
        address = address.data.result   
        // console.log(address)
        var recommend = address.address_component.province
        if (recommend != address.address_component.city) {
          recommend = recommend + address.address_component.city
        }
        if (index == 0) that.setData({ recommend_0: recommend })
        else if (index == 1) that.setData({ recommend_1: recommend })
        else if (index == 2) that.setData({ recommend_2: recommend })
        else return
      },
      fail: function(res) { console.log(res) }
    })

  }
})