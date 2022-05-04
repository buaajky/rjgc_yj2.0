// pages/MyLoc/MyLoc.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_hostname: utils.server_hostname,
    cover_item: "2rbsrOq1NwcOLxR93l3FxxQghbshuXny",

    favorLocs: [],
    blockLocs: [],
    hasFavors: false,
    hasBlocks: false,

    loc_num:2,

    loc_ids:[],
    loc_covers:[],
    loc_images:[],
    loc_descriptions:[],
    loc_names:[],

    index:0,
  },

  getFavorLoc: function() {
    console.log("getFavorLoc()")
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    /*wx.showLoading({
      title: '操作中',
      icon: 'loading'
    })*/

    wx.request({
      url: utils.server_hostname + "/api/core/flights/getMyFav/",
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {},

      success: function(res) {
        console.log(res)
        that.setData({
          favorLocs: res.data
        })
        if (that.data.favorLocs.length > 0) {
          that.setData({
            hasFavors: true
          })
        } else {
          that.setData({
            hasFavors: false
          })
        }
      },
      fail: function(err) {
        console.log(err)
        wx.showToast({
          title: '操作失败',
          duration: 1000,
          icon: 'error'
        })
      }
    })

    console.log("getFavorLoc() end")
  },

  getBlockLoc: function() {
    console.log("getBlockLoc()")
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    /*wx.showLoading({
      title: '操作中',
      icon: 'loading'
    })*/

    wx.request({
      url: utils.server_hostname + "/api/core/flights/getMyBlackPos/",
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {},

      success: function(res) {
        console.log(res)
        that.setData({
          blockLocs: res.data
        })
        if (that.data.blockLocs.length > 0) {
          that.setData({
            hasBlocks: true
          })
        } else {
          that.setData({
            hasBlocks: false
          })
        }
      },
      fail: function(err) {
        console.log(err)
        wx.showToast({
          title: '操作失败',
          duration: 1000,
          icon: 'error'
        })
      }
    })

    console.log("getBlockLoc() end")
  },

  /*getLocs: function(loc_num) {
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    wx.request({
      url: utils.server_hostname + "/api/core/position/",
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {},

      success: function(res) {
        console.log(res)

        var loclist = res.data.results
        // console.log(loclist)

        var loc_ids = that.data.loc_ids
        var loc_covers = that.data.loc_covers
        var loc_images = that.data.loc_images
        var loc_descriptions = that.data.loc_descriptions
        var loc_names = that.data.loc_names

        for (var i in loclist) {
          var loc = loclist[i]
          // console.log(loc)

          var cover
          if (loc.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
          else cover = utils.server_hostname + "/api/core/images/" + loc.cover + "/data/"
          var description
          if(loc.description == "") description = "暂无地点简介"
          else description = loc.description
          
          loc_ids.push(loc.id)
          loc_covers.push(cover)
          loc_descriptions.push(description)
          loc_names.push(loc.name)
          loc_images.push(loc.images)
        }

        that.setData({
          loc_ids: loc_ids,
          loc_covers:loc_covers,
          loc_descriptions:loc_descriptions,
          loc_names:loc_names,
          loc_images:loc_images,
        })
        
      },
      fail: function(err) {
        console.log(err);
      }
    })
  },*/

  navigate2FavorLoc: function(e) {
    console.log("navigate2FavorLoc")
    var index = parseInt(e.currentTarget.id)
    var loc = this.data.favorLocs[index]

    var loc_images = JSON.stringify(loc.images)
    utils.navigate2Loc(loc.id, loc.name, loc_images, loc.description, loc.cover)
  },

  navigate2BlockLoc: function(e) {
    console.log("navigate2BlockLoc")
    var index = parseInt(e.currentTarget.id)
    var loc = this.data.blockLocs[index]

    var loc_images = JSON.stringify(loc.images)
    utils.navigate2Loc(loc.id, loc.name, loc_images, loc.description, loc.cover)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getFavorLoc()
    this.getBlockLoc()
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
    console.log("onPullDownRefresh()")
    wx.showNavigationBarLoading()
    this.getFavorLoc()
    this.getBlockLoc()
    wx.showToast({
      title: '已刷新',
      duration: 1000
    });
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
    console.log("onPullDownRefresh() end")
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