const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: {
      institutions: 0,
      helpers: 0,
      elderly: 0
    }
  },

  onLoad() {
    this.setData({ 
      userInfo: app.globalData.userInfo || {}
    });
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  async loadStats() {
    try {
      // 加载院点数
      const instRes = await app.request({ url: '/api/institutions' });
      
      // 加载护工和老人总数
      const helperRes = await app.request({ url: '/api/helpers' });
      const elderlyRes = await app.request({ url: '/api/elderly' });
      
      this.setData({
        'stats.institutions': instRes.data.length,
        'stats.helpers': helperRes.data.length,
        'stats.elderly': elderlyRes.data.length
      });
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  },

  goToPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
