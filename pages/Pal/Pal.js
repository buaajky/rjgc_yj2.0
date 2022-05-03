const { server_imagename } = require("../../utils/util.js");
// pages/companion/companion.js
const utils = require("../../utils/util.js");


Page({
  /**
   * 页面的初始数据
   */
  data: {
    show:false,

    server_hostname: utils.server_hostname,
    server_imagename: server_imagename,

    author: {
      id: "",
      nickname:"",
      icon:'',
      cities: "",
      travels: ""
    },
    subscribed:false,

    pal: {
      id: "",
      position:{
        city:"",
        name:""
      },
      title:"",
      content:"",
      start_time:"",
      end_time:"",
      deadline:"",
      num:0,
      capacity:0,
      forbidden: 0
    },

    isMine:false,
    isEntered:false,
    next_comments:"init",
    comment_content:"",
    reply_id:"",
    reply_nickname:"发表评论",
    focus:"",

    unfold: false,

    participants:[],
    comment_list:[],
    comment_dict:{},

    dataList:[],
    myList:[],
    get_data: false,
    get_my: false,
    from_city:''
  },
  
  reply: function(event) {
    // console.log(event)
    var reply_id = event.currentTarget.id
    this.setData({
      reply_id: reply_id,
      reply_nickname: "回复：" + this.data.comment_dict[reply_id].owner.nickname,
      focus: true
    })
  },

  deleteReply: function(event) {
    var that = this
    wx.showModal({
      content: '只能删除自己发表的评论哦',
      title: '是否确认删除该评论？',
      success: function(choose) {
        if (choose.confirm) {
          var reply_id = event.currentTarget.id
          wx.request({
            url: utils.server_hostname + '/api/core/comments/' + reply_id + '/',
            method: "DELETE",
            header: {
              'content-type': 'application/json',
              'token-auth': wx.getStorageSync('token')
            },
            success: function(res) {
              console.log(res)
              // loginExpired?
              if (res.statusCode == 403) {
                wx.showToast({
                  title: '不能删除别人的评论',
                  icon: 'none',
                  duration: 1000
                })
              }
              else if (res.statusCode == 204) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'none',
                  duration: 1000
                })

                that.setData({
                  comment_list:[],
                  comment_dict: {},
                  next_comments: "init"
                })
                that.getComments()
              }
            }
          })
        }
      }
    })
  },

  sendComment: function() {
    var that = this
    if (that.data.comment_content == '') {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'error',
        duration: 1000
      })
      return
    }

    wx.showLoading({
      title: '发送中'
    })

    var data
    if (that.data.reply_id == '') data = { content: that.data.comment_content }
    else data = {
      content: that.data.comment_content,
      reply: that.data.reply_id
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    wx.request({
      url: utils.server_hostname + '/api/core/companions/' + that.data.pal.id + '/comments/',
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

        if (res.statusCode == 201) {
          wx.showToast({
            title: '评论成功',
            duration: 1000
          })
          that.setData({
            comment_list:[],
            comment_dict: {},
            next_comments: "init"
          })
          that.getComments()

          that.clearReply()
          that.setData({
            comment_content: ""
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  // 获取根评论及其回复
  getComments: function() {
    var that = this
    var url
    if (that.data.next_comments == "init") {
      url = utils.server_hostname + '/api/core/companions/' + that.data.pal.id + '/comments/?direct=true'
    } else {
      url = that.data.next_comments
    }

    if (url == null) return

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success: function(res) {
        // console.log(res)
        that.setData({
          next_comments: res.data.next
        })

        var list = res.data.results

        for (var i in list) {
          var item = list[i]
          // console.log(item)
          
          item["time"] = item["time"].substring(0,10) + " " + item["time"].substring(11,16)

          var comment_dict = that.data.comment_dict
          // 在comment_dict中插入item，并添加reply_list字段
          item["reply_list"] = []
          comment_dict[item.id] = item
          // 在comment_list中插入item.id
          var comment_list = that.data.comment_list
          comment_list.push(item.id)
          that.setData({
            comment_dict: comment_dict,
            comment_list: comment_list
          })
          that.getReply(item.id,true)
        }
        
        // console.log(that.data)
      },
      fail: function(res) { console.log(res) }
    })
  },
  
  // 获取回复
  getReply: function(father_id,init=false) {
    var that = this
    var father = that.data.comment_dict[father_id]
    var url
    if (init) {
      url = utils.server_hostname + '/api/core/comments/' + father.id + '/responses/?direct=false'
    } else {
      url = father.next
    }

    if (url == null) return

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success: function(res) {
        // console.log(res)
        
        father.next = res.data.next

        var list = res.data.results
        var comment_dict = that.data.comment_dict
        for (var i in list) {
          var item = list[i]
          // console.log(item)
          item["time"] = item["time"].substring(0,10) + " " + item["time"].substring(11,16)

          // 在comment_dict中father的reply_list字段插入item.id
          var reply_list = father["reply_list"]
          reply_list.push(item.id)
          father["reply_list"] = reply_list
          comment_dict[father_id] = father
          // 在comment_dict中插入item
          comment_dict[item.id] = item
        }
        that.setData({
          comment_dict: comment_dict
        })
        
        // console.log(that.data)
      },
      fail: function(res) { console.log(res) }
    })
  },
  
  moreReply: function(event) {
    this.getReply(event.currentTarget.id)
  },

  signUp:function(e) {
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      id: that.data.pal.id,
      cancel: false
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')

    wx.request({
      url: utils.server_hostname + '/api/core/users/join/',
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
        else if (res.statusCode == 206) {
          var data = res.data.data.failed[0]
          var code = data.code
          if (code == 624) {
            wx.showToast({
              title: '活动已截止报名',
              icon: 'none',
              duration: 1000
            })
          }
          else if (code == 621) {
            wx.showToast({
              title: '报名人数已满',
              icon: 'none',
              duration: 1000
            })
          }
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          wx.showToast({
            title: '报名成功',
            duration: 1000
          })
          var url = '/pages/Pal/Pal?'
          url = url + "pal_id=" + that.data.pal.id
          url = url + "&" + "author_id=" + that.data.author.id
          url = url + "&" + "author_icon=" + that.data.author.icon
          url = url + "&" + "author_nickname=" + that.data.author.nickname
          url = url + "&" + "author_cities=" + that.data.author.cities
          url = url + "&" + "author_travels=" + that.data.author.travels
          wx.redirectTo({
            url: url,
          });
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  quit: function(e) {
    wx.showLoading({
      title: '加载中'
    })

    var that = this
    var data = {
      id: that.data.pal.id,
      cancel: true
    }

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + '/api/core/users/join/',
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
        else if (res.statusCode == 206) {
          var data = res.data.data.failed[0]
          var code = data.code
          if (code == 624) {
            wx.showToast({
              title: '截止时间后不可取消报名',
              icon: 'none',
              duration: 1000
            })
          }
          return
        }
        //unlogin?

        if (res.statusCode == 200) {
          wx.showToast({
            title: '已取消报名',
            duration: 1000
          })
          var url = '/pages/Pal/Pal?'
          url = url + "pal_id=" + that.data.pal.id
          url = url + "&" + "author_id=" + that.data.author.id
          url = url + "&" + "author_icon=" + that.data.author.icon
          url = url + "&" + "author_nickname=" + that.data.author.nickname
          url = url + "&" + "author_cities=" + that.data.author.cities
          url = url + "&" + "author_travels=" + that.data.author.travels
          wx.redirectTo({
            url: url,
          });
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  fold: function(){
    this.setData({
      unfolded:false
    })
  },

  unfold: function(){
    this.setData({
      unfolded:true
    })
  },

  onShow: function() {
    var that = this
    that.setData({
      isMine:(that.data.author.id == parseInt(wx.getStorageSync('id')))
    })

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.request({
      url: utils.server_hostname + "/api/core/users/" + this.data.author.id + "/",
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success:function(res) {
        var data = res.data
        that.setData({
          subscribed: data.subscribed
        })
      },
      fail: function(res) { console.log(err); }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      show:show
    })
    // console.log(options)
    var that = this

    that.setData({
      author: {
        id: options.author_id,
        nickname: options.author_nickname,
        icon: options.author_icon,
        cities: options.author_cities,
        travels: options.author_travels
      }
    })

    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    var id = (wx.getStorageSync('id') == '')? "noid" : wx.getStorageSync('id')

    wx.request({
      url: utils.server_hostname + "/api/core/users/" + this.data.author.id + "/",
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },

      success:function(res) {
        // console.log(res)
        var data = res.data
        that.setData({
          subscribed: data.subscribed
        })
      },
      fail: function(res) { console.log(err); }
    })

    wx.request({
      url: utils.server_hostname + '/api/core/companions/' + options.pal_id + '/',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      success: function(res) {
        // console.log(res)

        var pal = res.data

        that.setData({
          pal: {
            id: pal.id,
            position: (pal.position == null)? that.data.position : pal.position,
            title: pal.title,
            content: pal.content,
            start_time: pal.start_time.substring(0, 10) + ' ' + pal.start_time.substring(11, 16),
            end_time: pal.end_time.substring(0, 10) + ' ' + pal.end_time.substring(11, 16),
            deadline: pal.deadline.substring(0, 10) + ' ' + pal.deadline.substring(11, 16),
            num: pal.fellows.length,
            capacity: pal.capacity,
            forbidden: pal.forbidden
          },
          isEntered: pal.joined,
          isMine: (pal.owner.id == id)? true : false,
        })

        if (pal.forbidden == 1) {
          that.setData({
            next_comments: null
          })
          return
        }

        var participants = []
        var fellows = pal.fellows
        for (var i in fellows) {
          var user = fellows[i]
          participants.push({
            id: user.id,
            icon: (user.icon == null)? utils.server_imagename + '/male.png' : utils.server_hostname + '/api/core/images/' + user.icon + '/data/'
          })
        }
        that.setData({
          participants: participants
        })

        that.getComments()
        // console.log(that.data.participants)
        // 2022
        that.get_traffic() 
        that.get_mytraffic()
      },
      fail: function(res) { console.log(res) }
    })
    // 2022
      var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
      var id_user = (wx.getStorageSync('id') == '')? 'noid' : wx.getStorageSync('id')
      wx.request({
        url: utils.server_hostname + "/api/core/users/" + id_user + "/",
        data: {
        },
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'token-auth': token
        },
        success: function(data) {
          // console.log(data);
          if (data.data.error_code == 404) {
            utils.loginExpired()
            return 
          }

          data = data.data
          var from = data.position.city.substring(0, data.position.city.length - 1)
          that.setData({
            from_city: from
          })
        },
        fail: function(res) { console.log(res); }
      })
  },

  navigate2footprint: function() {
    var author = this.data.author
    utils.navigate2footprint(author.id, author.nickname, author.icon, author.cities, author.travels)
  },

  navigate2OtherZone: function() {
    wx.navigateTo({
      url: '/pages/OtherZone/OtherZone?id=' + this.data.author.id,
    })
  },

  navigate2Fellow: function(event) {
    wx.navigateTo({
      url: '/pages/OtherZone/OtherZone?id=' + event.currentTarget.id,
    })
  },


  navigate2Replyer: function(event) {
    // console.log(event)
    wx.navigateTo({
      url: '/pages/OtherZone/OtherZone?id=' + event.currentTarget.id,
    })
  },

  subscribe: function(e) {
    var that = this
    var data = {
      id: that.data.author.id,
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
              subscribed: true
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
      id: that.data.author.id,
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
            subscribed: false
          })
        }
      },
      fail: function(res) { console.log(res) }
    })
  },

  commentInput: function(e) {
    this.setData({
      comment_content:e.detail.value
    })
  },

  clearReply: function() {
    this.setData({
      reply_id: "",
      reply_nickname: "发表评论"
    })
  },

  onPullDownRefresh: function () {
    var data = this.data
    var url = '/pages/Pal/Pal?'
    url = url + "pal_id=" + data.pal.id
    url = url + "&" + "author_id=" + data.author.id
    url = url + "&" + "author_icon=" + data.author.icon
    url = url + "&" + "author_nickname=" + data.author.nickname
    url = url + "&" + "author_cities=" + data.author.cities
    url = url + "&" + "author_travels=" + data.author.travels
    wx.redirectTo({
      url: url,
    })
  },

  get_traffic: function(){
    var that = this 
    var token = wx.getStorageSync('token')
    var loc = that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1)
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
            tmp1.traffic_company = res.data[i].airline
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
        // console.log(res.data)
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
            tmp1.traffic_city_start = res.data[i].owner.station
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

  get_mytraffic: function() {
    var that = this
    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
    that.setData({
      myList:[],
      get_my: false
    })
    wx.request({
      url: utils.server_hostname + '/api/core/plans/getMyComp/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id
        },
        success: function(res) {
          // console.log(res)
          // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
          if (res.data != false) {
            
            var tmp = []
            for (let i in res.data) {
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
              if (res.data[i].type1 == '火车') {
                wx.request({
                  url: utils.server_hostname + '/api/core/trains/getTrainInfo',
                  method: 'GET',
                  data: {
                    id: res.data[i].id1
                  },
                  success: (result) => {
                    // console.log(result.data)
                    var lll = result.data[0]
                    // console.log(lll)
                    tmp1.traffic_company = 'zt'
                    tmp1.traffic_number = lll.trainno
                    tmp1.traffic_date = lll.departdate
                    tmp1.traffic_time_start = lll.departtime.substring(0, 5)
                    tmp1.traffic_time_end = lll.arrivaltime.substring(0, 5)
                    var min = 10000
                    for (let j in lll.prices) {
                      if (lll.prices[j].price < min){min = lll.prices[j].price}
                    }
                    tmp1.traffic_price = min
                    tmp1.traffic_city_start = lll.station
                    tmp1.traffic_city_end = lll.endstation
                    tmp1.traffic_id = lll.id
                    tmp.push(JSON.parse(JSON.stringify(tmp1)))
                    // console.log(tmp)
                    that.setData({
                      myList: tmp
                    })
                  },
                  fail: (res) => {},
                })
              }
              else if (res.data[i].type1 == '飞机') {
                wx.request({
                  url: utils.server_hostname + '/api/core/flights/getFlightInfo',
                  method: 'GET',
                  data: {
                    flightid: res.data[i].id1
                  },
                  success: (result) => {
                    // console.log(result.data)
                    var lll = result.data[0]
                    // console.log(lll)
                    tmp1.traffic_company = lll.airline
                    tmp1.traffic_number = lll.flightno
                    tmp1.traffic_date = lll.departdate
                    tmp1.traffic_time_start = lll.departtime.substring(0, 5)
                    tmp1.traffic_time_end = lll.arrivaltime.substring(0, 5)
                    tmp1.traffic_price = lll.minprice
                    tmp1.traffic_city_start = lll.city
                    tmp1.traffic_city_end = lll.endcity
                    tmp1.traffic_id = lll.id
                    tmp.push(JSON.parse(JSON.stringify(tmp1)))
                    //  console.log(tmp)
                    that.setData({
                      myList: tmp
                    })
                  },
                  fail: (res) => {},
                })
              }
            }
            that.setData({
              get_my: true
            })
          }
        },
        fail: function(res) {
          console.log(res)
        },
    })
  },

  navigate2air: function(e) {
    var that = this
    //console.log(e)
    var index = e.currentTarget.dataset.index
    console.log(index)
  },
  
  navigate2train: function(e) {
    var that = this
    //console.log(e)
    var index = e.currentTarget.dataset.index
    console.log(index)
  },

  choose_air:function(e) {
    var that = this
    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
    // console.log(e.currentTarget.dataset.index)
    // console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/plans/addMyComp/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "飞机",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          that.get_mytraffic()
        }
        else {
          wx.showToast({
            title: '添加失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
    })
    wx.request({
      url: utils.server_hostname + '/api/core/plans/addMyPlan/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "飞机",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          wx.showToast({
            title: '已成功添加',
            icon: 'success'
          })
        }
        else {
          wx.showToast({
            title: '添加失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
        
    })
  },

  choose_train:function(e) {
    var that = this
    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
    // console.log(e.currentTarget.dataset.index)
    // console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/plans/addMyComp/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "火车",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          that.get_mytraffic()
        }
        else {
          wx.showToast({
            title: '添加失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      }, 
    })
    wx.request({
      url: utils.server_hostname + '/api/core/plans/addMyPlan/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "火车",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          wx.showToast({
            title: '已成功添加',
            icon: 'success'
          })
        }
        else {
          wx.showToast({
            title: '添加失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
        
    })
  },

  undo_choose_air:function(e) {
    var that = this
    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
    // console.log(e.currentTarget.dataset.index)
    // console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/plans/deleteMyComp/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "飞机",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          that.get_mytraffic()
        }
        else {
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
        
    })
    wx.request({
      url: utils.server_hostname + '/api/core/plans/deleteMyPlan/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "飞机",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          wx.showToast({
            title: '已取消',
            icon: 'success'
          })
        }
        else {
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
        
    })
  },

  undo_choose_train:function(e) {
    var that = this
    var token = (wx.getStorageSync('token') == '')? 'notoken' : wx.getStorageSync('token')
    // console.log(e.currentTarget.dataset.index)
    // console.log(token)
    wx.request({
      url: utils.server_hostname + '/api/core/plans/deleteMyComp/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "火车",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          that.get_mytraffic()
        }
        else {
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
        
    })
    wx.request({
      url: utils.server_hostname + '/api/core/plans/deleteMyComp/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        pal:that.data.pal.id,
        type: "直达",
        id1: String(e.currentTarget.dataset.index),
        type1: "火车",
        from1: that.data.from_city,
        to1: that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1),
        id2: null,
        type2: null,
        from2: null,
        to2: null
      },
      success: function(res) {
        // console.log(res)
        if (res.data == true) {
          wx.showToast({
            title: '已取消',
            icon: 'success'
          })
        }
        else {
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
        // console.log(that.data.pal.position.city.substring(0, that.data.pal.position.city.length - 1))
      },
      fail: function(res) {
        console.log(res)
      },
        
    })
  },

})