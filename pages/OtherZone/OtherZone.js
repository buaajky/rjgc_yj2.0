// pages/demo/demo.js
const utils = require("../../utils/util.js");

Page({

  /**
   * Page initial data
   */
  data: {
      server_imagename: utils.server_imagename,

      id:'',
      icon:utils.server_imagename + '/male.png',
      fans:'',
      concern:0,
      likes:'',

      nickname:"",
      gender:0,      /**0-male 1-female */
      signature:"",
      moreInfo:false,
      birthday:"",
      location:{
        latitude:-1,
        longitude:-1,
        name:"",
        address:{
          city:"",
          district:"",
          nation:"",
          province:"",
          street:"",
          street_number:""
        }
      },

      cities:0,
      travels:0,

      pressEditButton:false,

      showtab: 0, //顶部选项卡索引
      currentTab: 0,// tab切换
      tab: {
        tabnum: 2,
        tabitem: [
        {
        "id": 0,
        "text": "游记"
        },
        {
        "id": 1,
        "text": "同行"
        }
        ]
      },
      pageSize:1260,
      travel_num:3,
      next_travel:"init",
      pal_num:3,
      next_pal:"init",
      
      travel_ids:[],
      travel_covers:[],
      travel_names:[],
      travel_titles:[],
      travel_times:[],
      travel_reads:[],
      travel_likes:[],
      travel_comments:[],
      
      pal_ids:[],
      pal_titles:[],
      pal_startTimes:[],
      pal_endTimes:[],
      pal_locations:[],
      pal_nums:[],
      pal_capacities:[],
      pal_ownerids:[],
      pal_icons:[],
      pal_nicknames:[],
      pal_genders:[],
      pal_cities:[],
      pal_travels:[],

      concernOther : false,
      isMine: false
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中'
    })
    this.update()
    wx.hideLoading({
      success: (res) => {},
    })
    // console.log(this.data)
  },

  update: function() {
    var that = this
    var id = this.data.id
    // console.log(id)

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + "/api/core/users/" + id + "/",
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success: function(res) {
        // console.log(res);

        var data = res.data
        var location = (data.position == null)? that.data.location : utils.positionTransform(data.position)
        that.setData({
          id: id,
          fans: data.subscribers,
          concern: data.subscription,
          likes: data.likes,
          nickname: data.nickname,
          gender: data.gender,
          signature: (data.sign == null)? "" : data.sign,
          birthday: (data.birthday == null)? "" : data.birthday,
          location: location,
          cities: data.cities,
          travels: data.travels,
          icon: (data.icon == null)? utils.server_imagename + "/male.png" 
          : utils.server_hostname + "/api/core/images/" + data.icon + "/data/",
          concernOther: data.subscribed,
          isMine: (id == parseInt(wx.getStorageSync('id')))
        })

        that.getTravels(that.data.travel_num)
      },
      fail: function(res) { console.log(err); }
    })
  },

  getTravels: function(travel_num) {
    var that = this
    if (travel_num <= that.data.travel_ids.length) {
      that.setData({
        travel_num: travel_num,
        pageSize: travel_num * 430,
      })
      return
    }
    var url
    if (that.data.next_travel == "init") {
      url = utils.server_hostname + "/api/core/travels/?owner=" + this.data.id
    } else {
      url = that.data.next_travel
    }

    if (url == null) {
      travel_num = that.data.travel_ids.length
      that.setData({
        travel_num: travel_num,
        pageSize: travel_num * 430,
      })
      // console.log("no more travels")
      return
    }
    
    wx.request({
      url: url,
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success: function(res) {
        // console.log(res);

        var travellist = res.data.results
        // console.log(travellist)

        var travel_ids = that.data.travel_ids
        var travel_covers = that.data.travel_covers
        var travel_names = that.data.travel_names
        var travel_titles = that.data.travel_titles
        var travel_times = that.data.travel_times
        var travel_reads = that.data.travel_reads
        var travel_likes = that.data.travel_likes
        var travel_comments = that.data.travel_comments
        var travel_access = that.data.travel_access

        for (var i in travellist) {
          var travel = travellist[i]
          // console.log(travel)
          if (travel.forbidden == 1) continue

          var cover
          if (travel.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
          else cover = utils.server_hostname + "/api/core/images/" + travel.cover + "/data/"

          travel_ids.push(travel.id)
          travel_covers.push(cover)
          if (travel.position == null) travel_names.push('')
          else travel_names.push(travel.position.name)
          
          if (travel.title.length > 9) travel_titles.push(travel.title.substring(0,10) + '...')
          else travel_titles.push(travel.title)

          travel_times.push(travel.time.substring(0,10))

          if(travel.read_total >= 1000) travel_reads.push((travel.read_total / 1000).toFixed(1).toString() + 'k')
          else travel_reads.push(travel.read_total)
          
          if(travel.likes >= 1000) travel_likes.push((travel.likes / 1000).toFixed(1).toString() + 'k')
          else travel_likes.push(travel.likes)

          if(travel.comments >= 1000) travel_comments.push((travel.comments / 1000).toFixed(1).toString() + 'k')
          else travel_comments.push(travel.comments)
          // travel_access.push(travel.visibility)
        }

        that.setData({
          travel_ids: travel_ids,
          travel_covers:travel_covers,
          travel_names:travel_names,
          travel_titles:travel_titles,
          travel_times:travel_times,
          travel_reads:travel_reads,
          travel_likes:travel_likes,
          travel_comments:travel_comments,
          next_travel: res.data.next
          // travel_access:travel_access
        })

        if (travel_num > that.data.travel_ids.length) travel_num = that.data.travel_ids.length
        // no more travels
        
        that.setData({
          travel_num: travel_num,
          pageSize: travel_num * 430        
        })
        // console.log(that.data)
      },
      fail: function(res) { console.log(err); }
    })
  },

  getPals: function(pal_num) {
    var that = this
    if (pal_num <= that.data.pal_ids.length) {
      that.setData({
        pal_num: pal_num,
        pageSize: (pal_num == 0)? 460 : pal_num * 460,
      })
      return
    }
    var url
    if (that.data.next_pal == "init") {
      url = utils.server_hostname + "/api/core/companions/?owner=" + this.data.id
    } else {
      url = that.data.next_pal
    }

    if (url == null) {
      pal_num = that.data.pal_ids.length
      that.setData({
        pal_num: pal_num,
        pageSize: (pal_num == 0)? 460 : pal_num * 460,
      })
      // console.log("no more pals")
      return
    }
    
    wx.request({
      url: url,
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
      },
      success: function(res) {
        // console.log(res);

        var pallist = res.data.results
        // console.log(palllist)

        var pal_ids = that.data.pal_ids
        var pal_titles = that.data.pal_titles
        var pal_startTimes = that.data.pal_startTimes
        var pal_endTimes = that.data.pal_endTimes
        var pal_locations = that.data.pal_locations
        var pal_nums = that.data.pal_nums
        var pal_capacities = that.data.pal_capacities
        var pal_ownerids = that.data.pal_ownerids
        var pal_icons = that.data.pal_icons
        var pal_nicknames = that.data.pal_nicknames
        var pal_genders = that.data.pal_genders
        var pal_cities = that.data.pal_cities
        var pal_travels = that.data.pal_travels

        for (var i in pallist) {
          var pal = pallist[i]
          // console.log(pal)
          if (pal.forbidden == 1) continue

          var icon
          if (pal.owner.icon == null) icon = utils.server_imagename + "/male.png"
          else icon = utils.server_hostname + "/api/core/images/" + pal.owner.icon + "/data/"
          // console.log(icon)

          pal_ids.push(pal.id)
          
          if (pal.title.length > 19) pal_titles.push(pal.title.substring(0,20) + '...')
          else pal_titles.push(pal.title)

          pal_startTimes.push(pal.start_time.substring(0,10) + '-' + pal.start_time.substring(11,16))
          pal_endTimes.push(pal.end_time.substring(0,10) + '-' + pal.end_time.substring(11,16))
          if (pal.position == null) pal_locations.push('')
          else pal_locations.push(pal.position.province + pal.position.city + pal.position.district + pal.position.street_number + ' · ' + pal.position.name)

          pal_nums.push(pal.fellows.length)
          pal_capacities.push(pal.capacity)
          pal_ownerids.push(pal.owner.id)
          pal_icons.push(icon)
          pal_nicknames.push(pal.owner.nickname)
          pal_genders.push(pal.owner.gender)
          pal_cities.push(pal.owner.cities)
          pal_travels.push(pal.owner.travels)
        }

        that.setData({
          pal_ids: pal_ids,
          pal_titles: pal_titles,
          pal_startTimes: pal_startTimes,
          pal_endTimes: pal_endTimes,
          pal_locations: pal_locations,
          pal_nums: pal_nums,
          pal_capacities: pal_capacities,
          pal_ownerids: pal_ownerids,
          pal_icons: pal_icons,
          pal_nicknames: pal_nicknames,
          pal_genders: pal_genders,
          pal_cities: pal_cities,
          pal_travels: pal_travels,
          next_pal: res.data.next
        })

        // console.log(that.data)

        if (pal_num > that.data.pal_ids.length) pal_num = that.data.pal_ids.length
        // no more pals
        
        that.setData({
          pal_num: pal_num,
          pageSize: (pal_num == 0)? 460 : pal_num * 460        
        })
        // console.log(that.data)
      },
      fail: function(res) { console.log(res); }
    })
  },


  setTab: function (e) {
    var that = this
    that.setData({
      showtab: e.currentTarget.dataset.tabindex
    })
    if (that.data.currentTab === e.currentTarget.dataset.tabindex) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.tabindex
      })
    }
  },

  /**
  * 滑动切换tab
  */
  bindChange: function (e) {
    var that = this;
    if (e.detail.current == 0) that.getTravels(that.data.travel_num)
    else if (e.detail.current == 1) that.getPals(that.data.pal_num)

    that.setData({ 
      currentTab: e.detail.current,
      showtab: e.detail.current
    });
  },

  navigate2footprint: function(event) {
    utils.navigate2footprint(this.data.id, 
    this.data.nickname, this.data.icon, this.data.cities, this.data.travels)
  },

  navigate2Travel: function(event) {
    // console.log(event)
    var data = this.data
    var travel_id = data.travel_ids[parseInt(event.currentTarget.id)]
    utils.navigate2Travel(travel_id, data.id, data.icon, data.nickname, data.cities, data.travels)
  },

  navigate2Pal: function(event) {
    // console.log(event)
    var data = this.data
    var pal_id = data.pal_ids[parseInt(event.currentTarget.id)]
    utils.navigate2Pal(pal_id, data.id, data.icon, data.nickname, data.cities, data.travels)
  },


  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
    })
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    this.navigate2footprint()
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中'
    })

    if (this.data.showtab == 0){
      if (this.data.next_travel == null && this.data.travel_num == this.data.travel_ids.length) {
        wx.hideLoading({
          success: (res) => {},
        })
        return
      }
      this.getTravels(this.data.travel_num + 3)  
    }
    else if (this.data.showtab == 1) {
      if (this.data.next_pal == null && this.data.pal_num == this.data.pal_ids.length) {
        wx.hideLoading({
          success: (res) => {},
        })
        return
      }
      this.getPals(this.data.pal_num + 3)
    }

    wx.hideLoading({
      success: (res) => {},
    })
  },


  subscribe: function(e) {
    var that = this
    var data = {
      id: that.data.id,
      cancel: false
    }
    
    if (that.data.isMine) {
      wx.showToast({
        title: '无法关注自己',
        duration: 1000,
        icon:'error'
      })
    }
    else {
      wx.showLoading({
        title: '加载中'
      })

      wx.request({
        url: utils.server_hostname + '/api/core/users/subscribe/',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'token-auth': wx.getStorageSync('token')
        },
        data: data,
        success: function(res) {
          // console.log(res)
          wx.hideLoading({
            success: (res) => {},
          })

          if (res.statusCode == 403 || res.data.error_code == 605) {
            utils.unLogin()
            return
          }
          //unlogin?
  
          if (res.statusCode == 200) {
            wx.showToast({
              title: '关注成功',
              duration: 1000
            })
            that.setData({
              concernOther: true
            })
          }
        },
        fail: function(res) { console.log(res) }
      })
    }
  },

  disSubscribe: function() { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      id: that.data.id,
      cancel: true
    }
    wx.request({
      url: utils.server_hostname + '/api/core/users/subscribe/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': wx.getStorageSync('token')
      },
      data: data,
      success: function(res) {
        // console.log(res)
        wx.hideLoading({
          success: (res) => {},
        })

        if (res.statusCode == 403 || res.data.error_code == 605) {
          utils.unLogin()
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          wx.showToast({
            title: '取消关注成功',
            duration: 1000
          })
          that.setData({
            concernOther: false
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  preview: function(event) {
    wx.previewImage({
      current: event.currentTarget.id,
      urls: [event.currentTarget.id]
    })
  }
})