const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async onLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await app.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { username, password }
      });

      // 保存登录信息
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.user);
      
      app.globalData.token = res.data.token;
      app.globalData.userInfo = res.data.user;

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 根据角色跳转
      setTimeout(() => {
        if (res.data.user.role === 'super_admin') {
          wx.redirectTo({ url: '/pages/admin/dashboard/dashboard' });
        } else {
          wx.redirectTo({ url: '/pages/director/dashboard/dashboard' });
        }
      }, 1000);

    } catch (error) {
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
