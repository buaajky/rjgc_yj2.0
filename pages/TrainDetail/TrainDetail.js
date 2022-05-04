const { server_imagename } = require("../../utils/util.js");
// pages/TrainDetail/TrainDetail.js
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

    departdate:"",//"2022-04-24",
    arrivaldate:"",//"2022-04-24",
    departweek:"",
    startcity:"",//"武汉",
    endcity:"",//"广州",
    typename:"",//"高铁",

    startstation:"",//"武汉",
    endstation:"",//"广州南",
    trainno:"",//"G2055",
    departtime:"",//"16:43",
    arrivaltime:"",//"21:03",
    costtime:"",//"4h20min",
    overdate:"",

    prices: [],
    hasAdd:false,//是否加入出行计划
    
    //交互控制
    screen_h: 750,//手机屏幕高度，onLoad中获取
    tab_content_h: 600,//滑动是动态设置scroll-view的高度
    showNotice:false,//是否显示完整的通知（半屏弹窗）

    scrollTop: undefined
  },

  onPageScroll: function(res) {
    this.setData({
      scrollTop: res.scrollTop
    })
    this.setTabContentHeight()//自适应改scroll-view的高度
  },

  clickNoticeBar: function() {
    this.setData({
      showNotice: true
    })
  },

  addToPlan: function() {//加入出行计划 按钮
    //todo
    var that = this;
    if(wx.getStorageSync('token') == '') {
      utils.unLogin();
      return;
    }
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    //console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/plans/addMyPlan/',
      method:'POST',
      header:{
        'content-type': 'application/json',
        'token-auth': token
      },
      data:{
        "type":"直达",
        "id1":String(that.data.id),
        "type1":"火车",
        "from1":that.data.startcity,
        "to1":that.data.endcity,
        "id2":null,
        "type2":null,
        "from2":null,
        "to2":null,
      },
      success:function(res) {
        if (res.statusCode == 200) {
          if (res.data == true){
            that.setData({
              hasAdd:true
            })
            wx.showToast({
              title: '已加入出行计划',
              duration: 1000
            });
          }else {
            wx.showToast({
              title: '操作失败',
              duration:1000,
              icon:"error"
            })
          }
        }else if (res.statusCode == 403 || res.statusCode == 605) {
          utils.unLogin();
          return;
        }else {
          wx.showToast({
            title: '操作失败',
            duration:1000,
            icon:"error"
          })
        }
      },
      fail:function(err) {
        console.log(err);
        wx.showToast({
          title: '操作失败',
          duration:1000,
          icon:"error"
        })
      }
    })
  },

  deleteFromPlan:function() {//删除出行计划  按钮
    var that = this;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    //console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/plans/deleteMyPlan/',
      method:'POST',
      header:{
        'content-type': 'application/json',
        'token-auth': token
      },
      data:{
        "type":"直达",
        "id1":String(that.data.id),
        "type1":"火车",
        "from1":that.data.startcity,
        "to1":that.data.endcity,
        "id2":null,
        "type2":null,
        "from2":null,
        "to2":null,
      },
      success:function(res) {
        if (res.statusCode == 200 && res.data == true) {
          wx.showToast({
            title: '已删除该出行计划',
            duration: 1000
          });
          that.setData({
            hasAdd:false
          })
        }else if (res.statusCode == 603 || res.statusCode == 403){
          utils.unLogin();
          return;
        }else {
          wx.showToast({
            title: '操作失败',
            duration:1000,
            icon:"error"
          })
        }
      },
      fail:function(err) {
        console.log(err);
        wx.showToast({
          title: '操作失败',
          duration:1000,
          icon:"error"
        })
      }
    })
  },

  navigateTo12306:function() {
    wx.navigateTo({
      url: '/pages/12306/12306',
    })
  },

  navigate2map: function() {//在地图上查看
    var that = this;
    var tmp = [{
      type:"t",
      city1: that.data.startcity,
      city2: that.data.endcity,
      port1: that.data.startstation.split(' ')[0] + "站",
      port2: that.data.endstation.split(' ')[0] + "站",
    }];
    wx.navigateTo({
      url: '/pages/TransportMap/TransportMap?plans=' + JSON.stringify(tmp),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show,
      screen_h: wx.getSystemInfoSync().screenHeight,
    })
    
    // console.log(options)
    var that = this;
    //note:has default id
    var id = options.id? options.id:2;
    var city = options.city;
    var endcity = options.endcity;
    //获取列车信息
    wx.request({
      url: utils.server_hostname + '/api/core/trains/getTrainInfo?id=' + id,
      success:async function(res) {
        console.log(res);
        var tmp = res.data[0];
        //获取缺失的城市信息
        console.log(tmp)
        if (!city) {
          await that.getCity(tmp.station).then(
            function(data) {city = data.split("市")[0];},
            function(err) {console.log(err)}
          );
        }
        if (!endcity) {
          await that.getCity(tmp.endstation).then(
            function(data) {
              endcity = data.split("市")[0];
            },
            function(err) {console.log(err)}
          );
        }

        that.setData({
          id:id,
          departdate:tmp.departdate,
          arrivaldate:tmp.arrivaldate,
          startcity:city,
          endcity:endcity,
          typename:tmp.typename,
          startstation:tmp.station,
          endstation:tmp.endstation,
          trainno:tmp.trainno,
          departtime:that.getTime(tmp.departtime),
          arrivaltime:that.getTime(tmp.arrivaltime),
          costtime:that.getCosttime(tmp.costtime),
          prices:tmp.prices.sort((a, b) => {return a.price - b.price}),
          departweek: utils.getWeekByDate(tmp.departdate)
        })
        
        that.setTabContentHeight();
        that.setOverdate();
        that.getNoticeBar(endcity);//获取抵达城市防疫公告

        //获取用户是否已经加入出行计划
        var token = wx.getStorageSync('token');
        if (token != "") {//已登录
          console.log(token)
          wx.request({
            url: utils.server_hostname + '/api/core/plans/searchMyPlan/',
            method:'POST',
            header:{
              'content-type': 'application/json',
              'token-auth': token
            },
            data:{
              "type":"直达",
              "id1":String(id),
              "type1":"火车",
              "from1":city,
              "to1":endcity,
              "id2":null,
              "type2":null,
              "from2":null,
              "to2":null,
            },
            success:function(res) {
              console.log(res)
              if (res.statusCode == 200) {
                that.setData({
                  hasAdd:res.data
                })  
              }  
            },
            fail:function(err) {
              console.log(err);
            }
          })
        }
      },
      fail:function(err) {
        console.log(err);
      }
    })
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
          resolve(address? address.address_components.city:"");
        },
        fail: function(res) { console.log(res); reject();}
      })
    }
    )
  },

  setTabContentHeight: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#tab-content').boundingClientRect()
    query.exec(function(res){
      that.setData({
        tab_content_h: wx.getSystemInfoSync().windowHeight - res[0].top//屏幕高度 - #tab-content节点的上边界坐标
      })    
    })
    // console.log("now tab_content_h is")
    // console.log(that.data.tab_content_h)
  },

  setOverdate: function() {//计算当天/+x天
    var that = this
    if (that.data.departdate == that.data.arrivaldate) {
      that.setData({
        overdate: "当"
      })
    }else {
      var d = new Date(that.data.departdate.replace(/-/g, "/") + " 00:00:00")
      var a = new Date(that.data.arrivaldate.replace(/-/g, "/") + " 00:00:00")
      console.log(d.getDay)
      var day = parseInt((a.getTime() - d.getTime())/(1000 * 60 * 60 *24))
      console.log(day)
      that.setData({
        overdate: "+" + day
      })
    }
  },

  getTime: function(time) {
    var l = time.split(":");
    return l[0] + ":" + l[1];
  },

  getCosttime: function(t) {
    var ans = "";
    var l = t.split("h");
    if (l[0] != "0") ans += l[0] + "h";
    var m = l[1].split("m");
    if (m[0] != "0") ans += m[0] + "min";
    return ans;
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