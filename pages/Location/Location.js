// pages/locs.js
const { server_hostname } = require("../../utils/util.js");
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_imagename: utils.server_imagename,
    
    locs:{
      id:0,
      name:"默认地点名（具体地点页不显示）",
      cover:null,
      images:[],
      description:"默认简介（具体地点页不显示）",
    },

    notice: "默认防疫信息（具体地点页不显示）",
    showNotice: false,

    hasFavor: false,
    hasBlock: false,

    travel_ids:[],
    travel_covers:[],
    travel_names:[],
    travel_titles:[],
    travel_ownerids:[],
    travel_icons:[],
    travel_nicknames:[],
    travel_liked:[],
    travel_liked_now:[],
    travel_likes:[],
    travel_cities:[],
    travel_travels:[],

    travel_num:4,
    next_travel:"init",

    dataList: [],
    get_data: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this
    var images = []
    var list = JSON.parse(options.loc_images)
    for (var i in list) {
      images.push(utils.server_hostname + '/api/core/images/' + list[i] + '/data/')
    }
    var description = options.loc_description
    if (description == "") {
      description = "暂无地点简介"
    }
    var cover = options.loc_cover
    if (cover.search(server_hostname) == -1) {
      cover = server_hostname + '/api/core/images/' + cover + '/data/'
    }

    that.setData({
      locs: {
        id:options.loc_id,
        name:options.loc_name,
        images:images,
        description:description,
        cover:cover,
      },
    })

    that.getTravels(that.data.travel_num);

    // NEW
    that.getNoticeBar(that.data.locs.name); //获取抵达城市防疫公告
    if (wx.getStorageSync('token') != '') {
      that.favorLoc('que')
      that.blockLoc('que')
    }
    //console.log(this.data.locs)
    /* 2022 */
    that.get_traffic()
  },

  clickNoticeBar: function() {
    this.setData({
      showNotice: true
    })
  },
  getNoticeBar: function(city){
    var that = this;
    wx.request({
      url: utils.server_hostname + '/api/core/epidemicInfo/getInfo?position=' + city, // + '市',
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

  favorLoc: function(curOp) {
    console.log("favorLoc(" + curOp + ")")
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    /*wx.showLoading({
      title: '操作中',
      icon: 'loading'
    })*/

    var curUrl = utils.server_hostname + "/api/core/flights"
    if (curOp == 'add') {
      curUrl += "/addToFavorites/"
    } else if (curOp == 'del') {
      curUrl += "/deleteMyFavorites/"
    } else { // curOp == 'que'
      curUrl += "/isMyFavorites/"
    }

    wx.request({
      url: curUrl,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        position: that.data.locs.id
      },

      success: function(res) {
        console.log(res);
        if (curOp == 'add' && res.data == true) {
          wx.showToast({
            title: '已收藏',
            duration: 1000
          });
          that.setData({
            hasFavor: true
          })
        } else if (curOp == 'del' && res.data == true) {
          wx.showToast({
            title: '已取消收藏',
            duration: 1000
          });
          that.setData({
            hasFavor: false
          })
        } else if (curOp == 'que') {
          that.setData({
            hasFavor: res.data
          })
        } else {
          wx.showToast({
            title: '操作失败',
            duration: 1000,
            icon: 'error'
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

    console.log("favorLoc(" + curOp + ") end")
  },
  favorLocButton: function() {
    if(wx.getStorageSync('token') == '') {
      utils.unLogin();
      return;
    }
    if (this.data.hasFavor == false) {
      this.favorLoc("add")
    } else {
      this.favorLoc("del")
    }
  },

  blockLoc: function(curOp) {
    console.log("blockLoc(" + curOp + ")")
    var that = this
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    /*wx.showLoading({
      title: '操作中',
      icon: 'loading'
    })*/

    var curUrl = utils.server_hostname + "/api/core/flights"
    if (curOp == 'add') {
      curUrl += "/addblackPos/"
    } else if (curOp == 'del') {
      curUrl += "/deleteMyBlackPos/"
    } else { // curOp == 'que'
      curUrl += "/isMyBlackPos/"
    }

    wx.request({
      url: curUrl,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        position: that.data.locs.id
      },

      success: function(res) {
        console.log(res);
        if (curOp == 'add' && res.data == true) {
          wx.showToast({
            title: '已屏蔽',
            duration: 1000
          });
          that.setData({
            hasBlock: true
          })
        } else if (curOp == 'del' && res.data == true) {
          wx.showToast({
            title: '已取消屏蔽',
            duration: 1000
          });
          that.setData({
            hasBlock: false
          })
        } else if (curOp == 'que') {
          that.setData({
            hasBlock: res.data
          })
        } else {
          wx.showToast({
            title: '操作失败',
            duration: 1000,
            icon: 'error'
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

    console.log("blockLoc(" + curOp + ") end")
  },
  blockLocButton: function() {
    if (wx.getStorageSync('token') == '') {
      utils.unLogin();
      return;
    }
    if (this.data.hasBlock == false) {
      this.blockLoc("add")
    } else {
      this.blockLoc("del")
    }
  },







  /////////////////////////////////////////////////////////////////////

  onReachBottom: function () {
    wx.showLoading({
      title: '加载中'
    })
    
    this.getTravels(this.data.travel_num + 4)  

    wx.hideLoading({
      success: (res) => {},
    })
  },

  getTravels: function(travel_num) {
    var that = this
    if (travel_num <= that.data.travel_ids.length) {
      that.setData({
        travel_num: travel_num
      })
      return
    }
    var url
    if (that.data.next_travel == "init") {
      url = utils.server_hostname + '/api/core/travels/?position=' + that.data.locs.id
    } else {
      url = that.data.next_travel
    }

    if (url == null) {
      travel_num = that.data.travel_ids.length
      that.setData({
        travel_num: travel_num,
      })
      // console.log("no more travels")
      return
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
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
        var travellist = res.data.results

        var travel_ids = that.data.travel_ids
        var travel_covers = that.data.travel_covers
        var travel_names = that.data.travel_names
        var travel_titles = that.data.travel_titles
        var travel_ownerids = that.data.travel_ownerids
        var travel_icons = that.data.travel_icons
        var travel_nicknames = that.data.travel_nicknames
        var travel_likes = that.data.travel_likes
        var travel_cities = that.data.travel_cities
        var travel_travels = that.data.travel_travels
        var travel_liked = that.data.travel_liked
        var travel_liked_now = that.data.travel_liked_now
        for (var i in travellist) {
          var travel = travellist[i]
          // console.log(travel)
          if (travel.forbidden == 1) continue

          var icon
          if (travel.owner.icon == null) icon = utils.server_imagename + "/male.png"
          else icon = utils.server_hostname + "/api/core/images/" + travel.owner.icon + "/data/"

          var cover
          if (travel.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
          else cover = utils.server_hostname + "/api/core/images/" + travel.cover + "/data/"
      
          travel_ids.push(travel.id)
          travel_covers.push(cover)
          if (travel.position == null) travel_names.push('')
          else travel_names.push(travel.position.name)
          
          if (travel.title.length > 9) travel_titles.push(travel.title.substring(0,10) + '...')
          else travel_titles.push(travel.title)

          travel_ownerids.push(travel.owner.id)
          travel_icons.push(icon)
          travel_nicknames.push(travel.owner.nickname)
          travel_likes.push(travel.likes)
          travel_cities.push(travel.owner.cities)
          travel_travels.push(travel.owner.travels)
          travel_liked.push(travel.liked)
          travel_liked_now.push(travel.liked)
        }
        
        that.setData({
          travel_ids: travel_ids,
          travel_covers:travel_covers,
          travel_names:travel_names,
          travel_titles:travel_titles,
          travel_ownerids:travel_ownerids,
          travel_icons:travel_icons,
          travel_nicknames:travel_nicknames,
          travel_likes:travel_likes,
          travel_cities:travel_cities,
          travel_liked:travel_liked,
          travel_liked_now:travel_liked_now,
          next_travel: res.data.next
        })
        // console.log(that.data.travel_liked)
        if (travel_num > that.data.travel_ids.length) travel_num = that.data.travel_ids.length
        
        that.setData({
          travel_num: travel_num,     
        })
      }
    })        
  },

  thumbsUpRelative: function(res) { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      cancel: false
    }
    var index = res.currentTarget.id
    var liked = !that.data.travel_liked_now[index]
    var liked_edit = 'travel_liked_now['+index+']'

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel_ids[index] + '/like/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: data,
      success: function(res) {
        // console.log(res)
        wx.hideLoading({
          success: (res) => {},
        })

        if (res.statusCode == 403 || res.data.error_code == 605) {
          wx.showToast({
            title: '登陆后才能点赞哦',
            icon: 'none',
            duration: 1000
          })
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          that.setData({
            [liked_edit]:liked
          })
          wx.showToast({
            title: '点赞成功',
            duration: 1000
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  disThumbsUpRelative: function(res) { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      cancel: true
    }
    var index = res.currentTarget.id
    var liked = !that.data.travel_liked_now[index]
    var liked_edit = 'travel_liked_now['+index+']'
    
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/travels/' + that.data.travel_ids[index] + '/like/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: data,
      success: function(res) {
        // console.log(res)
        wx.hideLoading({
          success: (res) => {},
        })

        if (res.statusCode == 403 || res.data.error_code == 605) {
          wx.showToast({
            title: '登陆后才能取消点赞哦',
            icon: 'none',
            duration: 1000
          })
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          that.setData({
            [liked_edit]:liked
          })
          wx.showToast({
            title: '点赞已取消',
            duration: 1000
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  navigate2Travel: function(event) {
    // console.log(event)
    var data = this.data
    var index = parseInt(event.currentTarget.id)
    var travel_id = data.travel_ids[index]
    var author_id = data.travel_ownerids[index]
    var author_icon = data.travel_icons[index]
    var author_nickname = data.travel_nicknames[index]
    var author_cities = data.travel_cities[index]
    var author_travels = data.travel_travels[index]
    utils.navigate2Travel(travel_id, author_id, author_icon, author_nickname, author_cities, author_travels)
  },

  preview: function(event) {
    wx.previewImage({
      current: event.currentTarget.id,
      urls: this.data.locs.images
    })
  }

//   onShareAppMessage: function (res) {
//     // var id = this.data.locs.id
//     var imageUrl = this.data.locs.cover
//     var url = '/pages/Location/Location?'
//     // that.setData({
//     //   locs: {
//     //     id:options.loc_id,
//     //     name:options.loc_name,
//     //     images:images,
//     //     description:options.loc_description,
//     //     cover:options.loc_cover,
//     //   },
//     // })
//     var locs = this.data.locs
//     url = url + "loc_id=" + locs.id
//     url = url + "&" + "loc_name=" + locs.name
//     url = url + "&" + "loc_images=" + locs.images
//     url = url + "&" + "loc_description=" + locs.description
//     url = url + "&" + "loc_cover=" + locs.cover
//     console.log(url)
//     return {
//       title: 'Tripal: Find a Nice Place',
//       path: url,
//       imageUrl: imageUrl
//     }
//   }
,
get_traffic: function(){
  var that = this 
  var token = wx.getStorageSync('token')
  var loc = that.data.locs.name.substring(0, that.data.locs.name.length - 1)
  var tmp = []

  wx.request({
    url: utils.server_hostname + "/api/core/flights/getCheapFlight",
    method: 'GET',
    data: {
      position: loc
    },
    header: {
      'content-type': 'application/json',
      'token-auth': token
    },
    
    success: function(res) {
      // console.log(res.data)
      var size_list = res.data.length > 2 ? 1 : res.data.length
      var k = 0
      // console.log(res.data.length)
      for (let i = 0;i < res.data.length && k <= size_list; i++) {
        if (res.data[i].minprice > 0) {
          var tmp1 = {
            traffic_company:'',
            traffic_number:'',
            traffic_date:'',
            traffic_time_start:'',
            traffic_time_end:'',
            traffic_price:'',
            traffic_city_start:'',
            traffic_city_end:'',
            traffic_id:''
          }
          tmp1.traffic_company = utils.airline_Chinese_to_number(res.data[i].airline)
          tmp1.traffic_number = res.data[i].flightno
          tmp1.traffic_date = res.data[i].departdate
          tmp1.traffic_time_start = res.data[i].departtime.substring(0, 5)
          tmp1.traffic_time_end = res.data[i].arrivaltime.substring(0, 5)
          tmp1.traffic_price = res.data[i].minprice
          tmp1.traffic_city_start = res.data[i].city
          tmp1.traffic_city_end = res.data[i].endcity
          tmp1.traffic_id = res.data[i].id
          k++
          tmp.push(tmp1)
        }
      }
      that.setData({
        dataList: tmp
      })
      if (that.data.dataList != false) {
        that.setData({
          get_data: true
        })
      }
    },
    fail: function(res) {}
  })
  wx.request({
    url: utils.server_hostname + "/api/core/trains/getCheapTrain",
    method: 'GET',
    data: {
      position: loc
    },
    header: {
      'content-type': 'application/json',
      'token-auth': token
    },
    
    success: function(res) {
      console.log(res.data)
      var size_list = res.data.length > 2 ? 1 : res.data.length
      var k = 0
      // console.log(res.data.length)
      for (let i = 0;i < res.data.length && k <= size_list; i++) {
        if (res.data[i].price > 0) {
          var tmp1 = {
            traffic_company:'',
            traffic_number:'',
            traffic_date:'',
            traffic_time_start:'',
            traffic_time_end:'',
            traffic_price:'',
            traffic_city_start:'',
            traffic_city_end:'',
            traffic_id:''
          }
          tmp1.traffic_company = 'zt'
          tmp1.traffic_number = res.data[i].owner.trainno
          tmp1.traffic_date = res.data[i].owner.departdate
          tmp1.traffic_time_start = res.data[i].owner.departtime.substring(0, 5)
          tmp1.traffic_time_end = res.data[i].owner.arrivaltime.substring(0, 5)
          tmp1.traffic_price = res.data[i].price
          tmp1.traffic_city_start = res.data[i].owner.departstation
          tmp1.traffic_city_end = res.data[i].owner.endstation
          tmp1.traffic_id = res.data[i].owner.id
          k++
          tmp.push(tmp1)
        }
      }
      that.setData({
        dataList: tmp
      })
      if (that.data.dataList != false) {
        that.setData({
          get_data: true
        })
      }
    },
    fail: function(res) {}
  })

},

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
  //console.log(e)
  var index = e.currentTarget.dataset.index
  console.log(index)
  wx.navigateTo({
    url: '/pages/TrainDetail/TrainDetail?id=' + index,
  })
}
})