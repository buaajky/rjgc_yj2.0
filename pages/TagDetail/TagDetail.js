const { server_imagename } = require("../../utils/util.js");
// pages/TagDetail/TagDetail.js
const utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_hostname: utils.server_hostname,
    server_imagename: utils.server_imagename,

    tagname:"",
    visible:true,
    
    travel_ids:[],
    travel_covers:[],
    travel_names:[],
    travel_titles:[],
    travel_ownerids:[],
    travel_icons:[],
    travel_nicknames:[],
    travel_likes:[],
    travel_liked:[],
    travel_liked_now:[],
    travel_cities:[],
    travel_travels:[],

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

    views:0,//浏览量
    locheadpic:'',
    travelheadpic:'',
    locfinish:false,
    travelfinish:false,
    //游记、同行分页
    pageSize: 1260,
    pageSizeUnit:375,
    travelPageSize:375,
    palPageSize:375,  
    hasMoreTravel: false,
    hasMorePal:false,
    nextTravel:'init',
    nextPal:'init',

    isLocation:false,

    loc_id:'',
    loc_name:'',
    loc_images:[],
    loc_description:'',
    loc_cover:''
  },

  thumbsUp: function(res) { 
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      cancel: false
    }
    // console.log(res)
    var index = res.currentTarget.id
    var liked = !that.data.travel_liked_now[index]
    var liked_edit = 'travel_liked_now['+index+']'
    var likes_edit = 'travel_likes[' + index + ']'
    var num = that.data.travel_likes[index]

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
          utils.unLogin()
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          that.setData({
            [liked_edit]:liked,
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

  disThumbsUp: function(res) { 
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
    var likes_edit = 'travel_likes[' + index + ']'
    var num = that.data.travel_likes[index]
    
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
          utils.unLogin()
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          that.setData({
            [liked_edit]:liked,
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

  navigate2Pal: function(event) {
    // console.log(event)
    var data = this.data
    var index = parseInt(event.currentTarget.id)
    var pal_id = data.pal_ids[index]
    var author_id = data.pal_ownerids[index]
    var author_icon = data.pal_icons[index]
    var author_nickname = data.pal_nicknames[index]
    var author_cities = data.pal_cities[index]
    var author_travels = data.pal_travels[index]
    utils.navigate2Pal(pal_id, author_id, author_icon, author_nickname, author_cities, author_travels)
  },

  navigate2Loc: function() {
    // console.log(event)
    var data = this.data
    utils.navigate2Loc(data.loc_id,data.loc_name,JSON.stringify(data.loc_images), data.loc_description,data.loc_cover)
  },

  showMoreTravel:function(){
    this.getTravels()
  },

  showMorePal:function(){
    this.getPals()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;

    var tag = options.value? options.value:"#北京市#";
    tag = tag.replace(/^(\s|#)+|(\s|#)+$/g, '');//去掉首尾空白符和#号
    that.setData({
      tagname:tag,
    })

    that.getViews(tag);
    that.checkIsLocation(tag);
    that.getTravels(tag);
    that.getPals(tag);

    console.log(that.data)
  },

  getViews:function (tag) {
    var that = this;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token');
    wx.request({
      url: utils.server_hostname + '/api/core/tags/getTagRead/?content=' + tag,
      method:"GET",
      header:{
        'content-type': 'application/json',
        'token-auth':token
      },
      success:function (res) {
        console.log(res)
        if (res.statusCode == 200) {
            that.setData({
              views: res.data.read
            })
        }
      },
      fail:function (err) {
        console.log(err)
      }
    })
  },

  getTravels:function(tag) {
    var that = this;
    console.log(tag)
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    var url = utils.server_hostname + '/api/core/tags/searchTaggedTravels/?content=' + tag;

    if(that.data.nextTravel != "init"){
      url = that.data.nextTravel;
    }

    wx.request({
      url: url,
      method:"GET",
      header:{
        'content-type': 'application/json',
        'token-auth':token
      },
      success:function (res) {
        console.log(res);
        if (res.statusCode != 200 && res.statusCode != 204) {
          //400-uncreated
          that.setData({
            visible:false,
            visible_msg: res.data.replace('tag','该标签'),
            travelfinish:true
          })
          return;
        }

        var list = res.data.results;
        // console.log(list);
        
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

        //var view = 0;
        for (var i in list) {
          var travel = list[i].travel
          // console.log(travel)
          if (travel.forbidden == 1) continue

          var icon
          if (travel.owner.icon == null) icon = utils.server_imagename + "/male.png"
          else icon = utils.server_hostname + "/api/core/images/" + travel.owner.icon + "/data/"
          var cover
          if (travel.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg"
          else {
            cover = utils.server_hostname + "/api/core/images/" + travel.cover + "/data/";
            if (i == 0) {
              that.setData({
                travelheadpic:cover
              });
            }
          }
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
          //view = view + travel.read_total;
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
          travel_travels:travel_travels,
          travel_liked:travel_liked,
          travel_liked_now:travel_liked_now,
          nextTravel: res.data.next,
          hasMoreTravel: res.data.next == null ? false : true,
          //views:view + that.data.views,
          travelfinish:true,
        });
      },
      fail:function (err) {
        console.log(err)
        that.setData({
          travelfinish:true,
        })
      }
    })
  },

  getPals:function (tag) {
    var that = this;

    var url = utils.server_hostname + "/api/core/tags/searchTaggedCompanions/?content=" + tag;
    if(that.data.nextPal != "init"){
      url = that.data.nextPal
    }

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success:function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          if (res.statusCode == 400) {
            that.setData({
              created:false,
            })
          }
          return;
        }


        var list = res.data.results;
        console.log(list);

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

        //var view = 0;
        for (var i in list) {
            var pal = list[i].companion
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
            //todo view++
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
            nextPal: res.data.next,
            hasMorePal:res.data.next == null? false : true,
            //views:view + that.data.views
          })
      },
      fail:function (err) {
        console.log(err)
      }
    })
  },

  checkIsLocation:function (tag) {
    var that = this;
    wx.request({
      url: utils.server_hostname + "/api/core/position/?name=" + tag,
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success:function (res) {
        console.log(res);
        var list = res.data.results;
        if (list.length == 1 && tag == list[0].name) {
          var loc = list[0];
          var cover;
          if (loc.cover == null) cover = utils.server_imagename + "/travelRecordCover/1.jpg";
          else {
            cover = utils.server_hostname + "/api/core/images/" + loc.cover + "/data/";
            that.setData({
              locheadpic:cover
            });
          }
          var description;
          if(loc.description == "") description = "暂无地点简介";
          else description = loc.description;

          that.setData({
            isLocation:true,
            loc_id:loc.id,
            loc_name:loc.name,
            loc_images:loc.images,
            loc_description:description,
            loc_cover:cover,
          })
        }

        that.setData({
          locfinish:true,
        })
      },
      fail:function (err) {
        console.log(err);
        that.setData({
          locfinish:true,
        })
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