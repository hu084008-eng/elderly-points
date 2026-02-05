App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000' // 开发环境，生产环境改为服务器地址
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  // 全局请求方法
  request(options) {
    const { url, method = 'GET', data, header = {} } = options;
    const { baseUrl, token } = this.globalData;

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...header
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // token 过期，跳转到登录页
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.redirectTo({ url: '/pages/login/login' });
            reject(new Error('登录已过期'));
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: reject
      });
    });
  }
});
