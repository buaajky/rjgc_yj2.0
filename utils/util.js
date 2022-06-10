const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const server_hostname = {
  //url: "https://tra-fr-2.zhouyc.cc"
  // url: "https://114.116.197.121"
  // url:"http://114.116.53.144"
  // url:"http://localhost"
  url: "http://114.116.197.121:9000"
}

module.exports = {
  formatTime,
  server_hostname: server_hostname.url,
  server_imagename: server_hostname.url + '/media',
  subkey:'F5PBZ-OEJK4-PEFUZ-D4MXI-MKQYS-V4FYQ',

  loginExpired:function() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
    
    wx.showToast({
      title: '登陆已过期',
      icon: 'error',
      duration: 1000
    })
  },

  unLogin:function() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
    
    wx.showToast({
      title: '未登陆',
      icon: 'error',
      duration: 1000
    })
  },

  positionTransform: function(position) { // 将后端 position 格式转换为前端格式
    var location = {
      latitude: position.latitude,
      longitude: position.longitude,
      name: position.name,
      address:{
        city: position.city,
        district: position.district,
        nation: position.nation,
        province: position.province,
        street: position.street,
        street_number: position.street_number
      }
    }
    return location
  },

  navigate2footprint: function(id, nickname, icon, cities, travels) {
    var url = '/pages/footprint/footprint?'
    url = url + "id=" + id
    url = url + "&" + "nickname=" + nickname
    url = url + "&" + "icon=" + icon
    url = url + "&" + "cities=" + cities
    url = url + "&" + "travels=" + travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Travel: function(travel_id, author_id, author_icon, author_nickname, author_cities, author_travels) {
    var url = '/pages/travel/travel?'
    url = url + "travel_id=" + travel_id
    url = url + "&" + "author_id=" + author_id
    url = url + "&" + "author_icon=" + author_icon
    url = url + "&" + "author_nickname=" + author_nickname
    url = url + "&" + "author_cities=" + author_cities
    url = url + "&" + "author_travels=" + author_travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Pal: function(pal_id, author_id, author_icon, author_nickname, author_cities, author_travels) {
    var url = '/pages/Pal/Pal?'
    url = url + "pal_id=" + pal_id
    url = url + "&" + "author_id=" + author_id
    url = url + "&" + "author_icon=" + author_icon
    url = url + "&" + "author_nickname=" + author_nickname
    url = url + "&" + "author_cities=" + author_cities
    url = url + "&" + "author_travels=" + author_travels
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Loc: function(loc_id,loc_name,loc_images,loc_description,loc_cover) {
    var url = '/pages/Location/Location?'
    url = url + "loc_id=" + loc_id
    url = url + "&" + "loc_name=" + loc_name
    url = url + "&" + "loc_images=" + loc_images
    url = url + "&" + "loc_description=" + loc_description
    url = url + "&" + "loc_cover=" + loc_cover
    wx.navigateTo({
      url: url,
    });
  },

  navigate2Release: function() {
    var token = wx.getStorageSync('token')
    var id = wx.getStorageSync('id')
    // console.log(token)
    // console.log(id)

    wx.request({
      url: server_hostname.url + "/api/core/users/" + id + "/",
      data: {
      },
      method: 'GET',
      header: {
      'content-type': 'application/json',
      'token-auth': token
      },
      success: function(res) {
        if (res.statusCode == 404) {
          wx.navigateTo({
            url: '/pages/login/login',
          })
          
          wx.showToast({
            title: '未登陆',
            icon: 'error',
            duration: 1000
          })
          return
        }

        // wx.showActionSheet({
        //   alertText:"请选择发布种类",
        //   itemList: ['游记', '同行', '取消'],
        //   itemColor:'#007aff',
        //   success (res) {
        //     console.log(res.tapIndex)
        //     if(res.tapIndex == 0){
        //       wx.navigateTo({
        //         url: '/pages/ReleasePal/ReleasePal',
        //       })
        //     }else if(res.tapIndex == 1){
        //       wx.navigateTo({
        //         url: '/pages/Release/Release',
        //       })
        //     }else{

        //     }
        //   },
        //   fail (res) {
        //     console.log(res.errMsg)
        //   }
        // })
        wx.showModal({
          title: "发布信息",
          content: "发生肾么事了？",
          confirmText: "发布",
          success (res) {
            if (res.confirm) {
              wx.showModal({
                title:"请选择发布种类",
                cancelText: "游记",
                confirmText: "同行",
                cancelColor: '#576B95',
                success(res){
                  if(res.confirm){
                    wx.navigateTo({
                      url: '/pages/ReleasePal/ReleasePal',
                    })
                  }else if(res.cancel){
                    wx.navigateTo({
                      url: '/pages/Release/Release',
                    })
                  }
                }
              })
            
            } 
          },
          fail (res) { console.log(res) }
        })
      }
    })
  },

  /*函数节流*/
  throttle: function(fn, interval) {
    var enterTime = 0;//触发的时间
    var gapTime = interval || 100 ;//间隔时间，如果interval不传，则默认100ms
    return function() {
      var context = this;
      var backTime = new Date();//第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context,arguments);
        enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  },

  /*函数防抖*/
  debounce:function(fn, interval) {
    var timer;
    var gapTime = interval || 10;//间隔时间，如果interval不传，则默认1000ms
    return function() {
      clearTimeout(timer);
      var context = this;
      var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
      timer = setTimeout(function() {
        fn.call(context,args);
      }, gapTime);
    };
  },

  authorize: function() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
          })
        }
      }
    })
  },

  /*获取日期是星期几 */
  getWeekByDate: function(dates) {
    let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
    let date = new Date(dates);
    date.setDate(date.getDate());
    let day = date.getDay();
    return show_day[day];
  },

  /*输入格式 "yyyy-mm-dd hh:mm:ss"（顺序无关），返回两者相差的时间，输出格式例子："2h30min"、"30min" */
  calIntervalTime: function(date1, date2) {
    var d1 = new Date(date1.replace(/-/g, "/"));
    var d2 = new Date(date2.replace(/-/g, "/"));
    var hour = parseInt(Math.abs(d1.getTime() - d2.getTime())/(1000 * 60 * 60));
    var minute = parseInt((Math.abs(d1.getTime() - d2.getTime())%(1000 * 60 * 60))/(1000 * 60));
    // console.log(hour);
    // console.log(minute);
    var ans = "";
    if (hour > 0) ans += hour + "h";
    if (minute > 0) ans += minute + "min";
    return ans;
  },

  airline_Chinese_to_number: function(input) {
    var ans = 'airline_';
    if (input == "成都航空") {
      ans = ans + 'cd';
    }
    else if (input == "春秋航空") {
      ans = ans + 'cq';
    }
    else if (input == "东方航空") {
      ans = ans + 'df';
    }
    else if (input == "海南航空") {
      ans = ans + 'hn';
    }
    else if (input == "华夏航空") {
      ans = ans + 'hx';
    }
    else if (input == "吉祥航空") {
      ans = ans + 'jx';
    }
    else if (input == "南方航空") {
      ans = ans + 'nf';
    }
    else if (input == "厦门航空") {
      ans = ans + 'xm';
    }
    else if (input == "山东航空") {
      ans = ans + 'sd';
    }
    else if (input == "上海航空") {
      ans = ans + 'sh';
    }
    else if (input == "深圳航空") {
      ans = ans + 'sz';
    }
    else if (input == "首都航空") {
      ans = ans + 'bj';
    }
    else if (input == "四川航空") {
      ans = ans + 'sc';
    }
    else if (input == "天津航空") {
      ans = ans + 'tj';
    }
    else if (input == "西藏航空") {
      ans = ans + 'xz';
    }
    else if (input == "长龙航空") {
      ans = ans + 'cl';
    }
    else if (input == "中国国航") {
      ans = ans + 'gh';
    }
    else if (input == "中国联航") {
      ans = ans + 'lh';
    }
    else {
      ans = ans + 'default';
      // ans = 'airline_default';
    }
    return ans;
  }

}
