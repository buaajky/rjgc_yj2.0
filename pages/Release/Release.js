// pages/Release/Release.js
const utils = require("../../utils/util.js");

Page({
  data: {
    show:false,

    server_imagename: utils.server_imagename,

    cover_url: utils.server_imagename + '/cover.jpg',
    img_url: [],
    title:'',
    content:'',
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
    access:1,
    access_list: ["公开","仅自己可见"],


    bottomTags: [
      // {
      //   name: "咱就是说",
      // },
      // {
      //   name: "绝绝子",
      // },
      // {
      //   name: "一整个美住了",
      // },
      // {
      //   name: "浅拍一下",
      // },
      // {
      //   name: "好看到翘jiojio",
      // },
      // {
      //   name: "是谁心动了",
      // },
      // {
      //   name: "北京市",
      // }
    ],
    insideTags: []
  },

  //发布按钮事件
  post:function(){
    var formatCheck = ""
    if (this.data.title == "") formatCheck = "请输入标题"
    else if (this.data.content == "") formatCheck = "请输入正文"
    else if (this.data.location.latitude == -1) formatCheck = "请添加地点"
    if (formatCheck != "") {
      wx.showToast({
        title: formatCheck,
        icon: 'error',
        duration: 1000
      })
      return 
    }

    var that = this;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.showLoading({
      title: '上传中',
    })
    
    // console.log(that.data.location)

    wx.request({
      url: utils.server_hostname + "/api/core/travels/",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        title: that.data.title,
        content: that.data.content,
        position: that.data.location,
        visibility: that.data.access
      },

      success: function(data) {
        console.log(data);
        wx.hideLoading({
          success: (res) => {},
        })
        
        if (data.data.error_code == 605 || data.data.error_code == 400) {
          utils.loginExpired()
          return
        }
        // loginExpired

        var travel_id = data.data.id

        if (that.data.cover_url != utils.server_imagename + '/cover.jpg') {
          that.imageUpload(that.data.cover_url, travel_id, 'cover')
        }
        let img_url = that.data.img_url;
        for (let i = 0; i < img_url.length; i++) {
          that.imageUpload(img_url[i], travel_id, 'image')
        }

        // NEW

        that.uploadTags(travel_id, 'inside')
        that.uploadTags(travel_id, 'bottom')

        // NEW end

        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 500
        })

        setTimeout(function () {
          var pages = getCurrentPages();
          var url = '/' + pages[pages.length - 2].route

          wx.navigateBack({
            delta: 1,
          })

          if (url == "/pages/MyZone/MyZone") {
            wx.redirectTo({
              url: url,
            })
          }
        }, 500)
      },
      fail: function(res) { console.log(res); }
    })
  },

  //图片上传
  imageUpload: function (filePath, travel_id, api) {
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.uploadFile({
      //路径填你上传图片方法的地址
      url: utils.server_hostname + '/api/core/travels/' + travel_id + '/' + api + '/',

      filePath: filePath,
      name: 'image',
      formData: { },
      header:{
        'token-auth': token
      },

      success: function (res) {
        console.log(res)
        if (res.statusCode == 413 || res.statusCode == 500) {
          wx.showToast({
            title: "图片太大",
            icon: 'none',
            duration: 1000
          })
          return
        }

        var data = JSON.parse(res.data)
        if (data.error_code == 604) utils.loginExpired()
      },
      fail: function (res) { console.log(res) }
    })
  },
  
  // 监听并更新用户输入信息
  input: function(event) {
    var key = event.currentTarget.id
    var value = event.detail.value
    this.setData({[key]:value})
  },

  chooseCover: function() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
          that.setData({
            cover_url: res.tempFilePaths[0]
          })
        }
    })  
  },

  chooseimage:function(){
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        if (res.tempFilePaths.length>0){
 
          //把每次选择的图push进数组
          let img_url = that.data.img_url;
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            img_url.push(res.tempFilePaths[i])
          }
          that.setData({
            img_url: img_url
          })
        }
      }
    })  
  },

  chooseLocation:function(){
    utils.authorize()
    var that = this
    wx.chooseLocation({
      success(res) {
        // console.log(res)
        var name = res.name
        var latitude = res.latitude
        var longitude = res.longitude

        var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
        + latitude + "," + longitude + "&key=" + utils.subkey;
        wx.request({        
          url: getAddressUrl,
          success: function (address) {   
            address = address.data.result   
            // console.log(address)

            that.setData({
              location: {
                latitude: latitude,
                longitude: longitude,
                name: name,
                address: address.address_component
              }
            })
            // console.log(that.data)
          },
          fail: function(res) { console.log(res) }
        })
      },
      fail: function(res) { console.log(res) }
    })
  },

  chooseVis:function(options){
    var that = this
    wx.showActionSheet({
      itemList: ["公开","仅自己可见"],
      success(res){
        // console.log(res.tapIndex)
        that.setData({
          access:res.tapIndex
        })
      }
    })
  },

  onLoad: function (options) {
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      // show: show
      show: true
    })
  },

  /* NEW */

  chooseBottomTags: function() {
    var that = this
    console.log("chooseBottomTags")
    that.navigate2AddTag()
  },

  navigate2AddTag: function() {
    var that = this
    var url = '/pages/AddTag/AddTag?'
    url = url + "bottomTags=" + JSON.stringify(that.data.bottomTags)
    url = url + "&" + "city=" + that.data.location.address.city
    wx.navigateTo({
      url: url,
    });
  },

  deleteBottomTag: function(e) {
    var that = this
    console.log("deleteBottomTag")
    var bottomTags = that.data.bottomTags
    var tagName = e.currentTarget.dataset.name
    for (let i in bottomTags) {
      if (tagName == bottomTags[i].name) {
        bottomTags.splice(i, 1)
        break
      }
    }
    that.setData({
      bottomTags: bottomTags
    })
    wx.showToast({
      title: '已移除标签',
      duration: 1000
    })
  },

  deleteInsideTag: function(e) {
    var that = this
    console.log("deleteinsideTag")
    var insideTags = that.data.insideTags
    var tagName = e.currentTarget.dataset.name
    for (let i in insideTags) {
      if (tagName == insideTags[i].name) {
        insideTags.splice(i, 1)
        break
      }
    }
    that.setData({
      insideTags: insideTags
    })

    var content = that.data.content
    var tagLen = tagName.length
    for (var i = 0; i < content.length; ++i) {
      if (tagName == content.substr(i, tagLen)) {
        content = content.substring(0, i-1) + content.substring(i + tagLen + 1)
        // content = content.substring(0, i-1)
        //         + content.substring(i, i+tagLen)
        //         + content.substring(i+tagLen+1)
      }
    }
    that.setData({
      content: content
    })

    wx.showToast({
      title: '移除成功',
      duration: 1000
    })
  },

  isNewInsideTag: function(curTag, curInsideTags) {
    for (let i in curInsideTags) {
      if (curInsideTags[i].name == curTag.name) {
        return false
      }
    }
    return true
  },

  input_2: function(e) {
    var that = this
    var key = e.currentTarget.id
    var value = e.detail.value
    this.setData({[key]:value})

    var cnt = 0
    var curTag = {
      name: ''
    }
    var curInsideTags = []
    for (var i = 0; i < value.length; ++i) {
      if (value[i] == '#') {
        cnt++
        if (cnt % 2 == 1) { // 左#
          curTag.name = ''
        } else if (that.isNewInsideTag(curTag, curInsideTags)) { // 右#
          curInsideTags.push(JSON.parse(JSON.stringify(curTag)))
        }
        continue
      }
      if (cnt % 2 == 1) {
        curTag.name += value[i]
      }
    }
    that.setData({
      insideTags: curInsideTags
    })
  },

  uploadTags: function(travel_id, type) {
    var that = this
    console.log("uploadTags("+type+")")
    
    var url
    var names = []
    if (type == 'inside') {
      url = utils.server_hostname + "/api/core/tags/saveTravelInTextTags/"
      var insideTags = that.data.insideTags
      for (let i in insideTags) {
        names.push(insideTags[i].name)
      }
    } else if (type == 'bottom') {
      url = utils.server_hostname + "/api/core/tags/saveTravelEndTextTags/"
      var bottomTags = that.data.bottomTags
      for (let i in bottomTags) {
        names.push(bottomTags[i].name)
      }
      var city = that.data.location.address.city
      names.push(city)
    }

    if (names.length > 0) {
      wx.request({
        url: url,
        method: 'POST',
        header: {
          'content-type': 'application/json',
        },
        data: {
          travel_id: travel_id,
          names: names
        },
        success: function(res) {
          // console.log(res)
          if (res.data == false) {
            wx.showToast({
              title: '标签上传失败',
              duration: 1000,
              icon: 'error'
            })
          }
        },
        fail: function(err) {
          console.log(err)
          wx.showToast({
            title: '标签上传失败',
            duration: 1000,
            icon: 'error'
          })
        }
      })
    }
  },

  emptyBehavior: function() {}
})