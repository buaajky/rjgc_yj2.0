const { server_imagename } = require("../../utils/util.js");
// pages/PlaneDetail.js
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
    departweek:"",
    arrivaldate:"",//"2022-04-24",
    departtime:"",//"11:40",
    arrivaltime:"",//"14:10",
    departcity:"",//"北京",
    arrivalcity:"",//"武汉",
    departport:"",//"大兴国际机场",
    arrivalport:"",//"天河机场 T2",
    costtime:"",//"2h30min",
    flightno:"",//"MU2452",
    flightcom:"",//"东航",
    punc:"",//"95",//准点率
    food:0,
    foodlist:["无", "有"],
    craft:"",//"738",
    overdate:"",
    hasAdd:false,//是否已加入用户的出行计划

    jjcPrices:[],
    gwcPrices:[],
    
    //交互控制
    screen_h: 750,//手机屏幕高度，onLoad中获取
    tab_content_h: 600,//滑动是动态设置scroll-view的高度
    showNotice:false,//是否显示完整的通知（半屏弹窗）

    scrollTop: undefined
  },

  onPageScroll: function(res) {//监听页面滑动
    this.setData({
      scrollTop: res.scrollTop//吸顶容器l-sticky
    })
    this.setTabContentHeight()//自适应改scroll-view的高度
  },

  clickNoticeBar: function() {//弹出 防疫公告
    this.setData({
      showNotice: true
    })
  },

  addToPlan: function() {//加入出行计划 按钮
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
        "type1":"飞机",
        "from1":that.data.departcity,
        "to1":that.data.arrivalcity,
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
        "type1":"飞机",
        "from1":that.data.departcity,
        "to1":that.data.arrivalcity,
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

  navigate2map: function() {//在地图上查看
    var that = this;
    var tmp = [{
      type:"a",
      city1: that.data.departcity,
      city2: that.data.arrivalcity,
      port1: that.data.departport.split(' ')[0],
      port2: that.data.arrivalport.split(' ')[0],
    }];
    wx.navigateTo({
      url: '/pages/TransportMap/TransportMap?plans=' + JSON.stringify(tmp),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    var show = app.globalData.show;
    this.setData({
      show:show,
      screen_h: wx.getSystemInfoSync().screenHeight,
    });
    
    // console.log(options)
    var that = this;
    //note:has default id
    var id = options.id? options.id:3993;
    console.log(options)
    //获取基本信息
    wx.request({
      url: utils.server_hostname + '/api/core/flights/getFlightInfo?flightid=' + id,
      success:function(res) {
        var tmp = res.data[0];
        
        that.setData({
          id:id,
          departdate:tmp.departdate,
          arrivaldate:tmp.arrivaldate,
          departtime:that.getTime(tmp.departtime),
          arrivaltime:that.getTime(tmp.arrivaltime),
          departcity:tmp.city,
          arrivalcity:tmp.endcity,
          departport:tmp.departport + " " + tmp.departterminal,
          arrivalport:tmp.arrivalport + " " + tmp.arrivalterminal,
          costtime:that.getCosttime(tmp.costtime),
          flightno:tmp.flightno,
          flightcom:tmp.airline,
          punc:tmp.punctualrate,//准点率
          food:tmp.food == false? 0:1,
          craft:tmp.craft,
          departweek: utils.getWeekByDate(tmp.departdate),
        });
        
        that.setTabContentHeight();
        that.setOverdate();
        that.getNoticeBar(tmp.endcity);//获取抵达城市防疫公告

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
              "type1":"飞机",
              "from1":tmp.city,
              "to1":tmp.endcity,
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
        //获取票价
        wx.request({
          url: utils.server_hostname + '/api/core/flights/getPriceList?id=' + id,
          success:function(res) {
            that.dealPriceList(res.data);
          },
          fail:function(err) {
            console.log(err)
          }
        });
      },
      fail:function(err) {
        console.log(err)
      }
    });
  },

  setTabContentHeight: function() {//票价滑动 自适应高度
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

  getCosttime: function(time) {
    var l = time.split(":");
    var ans = "";
    if (l[0] != "0" && l[0] != "00") ans += l[0] + "h";
    if (l[1] != "00") ans += l[1] + "min";
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

  dealPriceList: function(list) {
    var that = this;
    var g = [];
    var j = [];
    for (var i in list) {
      if (list[i].cabinname == "经济舱") j.push(list[i]);
      else if (list[i].cabinname == "公务舱") g.push(list[i])
    }
    var hash = {};
    j = j.reduce((preVal, curVal) => {
      hash[curVal.price] ? '' : hash[curVal.price] = true && preVal.push(curVal);
      return preVal}, []);
    hash = {};
    g = g.reduce((preVal, curVal) => {
      hash[curVal.price] ? '' : hash[curVal.price] = true && preVal.push(curVal);
      return preVal}, []);
    //价格升序排列
    j.sort((a, b) => {return a.price - b.price});
    g.sort((a, b) => {return a.price - b.price});
    that.setData({
      jjcPrices: j,
      gwcPrices: g,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})