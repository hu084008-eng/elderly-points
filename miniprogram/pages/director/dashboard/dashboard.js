const app = getApp();

Page({
  data: {
    userInfo: {},
    institution: {},
    stats: {
      helpers: 0,
      elderly: 0,
      totalPoints: 0
    }
  },

  onLoad() {
    this.setData({ 
      userInfo: app.globalData.userInfo || {},
      institution: app.globalData.userInfo?.institution || {}
    });
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  async loadStats() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo?.institution_id) return;

    try {
      // 加载本院护工
      const helperRes = await app.request({ 
        url: '/api/helpers',
        data: { institution_id: userInfo.institution_id }
      });
      
      // 加载本院老人
      const elderlyRes = await app.request({ 
        url: '/api/elderly',
        data: { institution_id: userInfo.institution_id }
      });
      
      // 计算总积分
      const helperPoints = helperRes.data.reduce((sum, h) => sum + h.total_points, 0);
      const elderlyPoints = elderlyRes.data.reduce((sum, e) => sum + e.total_points, 0);
      
      this.setData({
        'stats.helpers': helperRes.data.length,
        'stats.elderly': elderlyRes.data.length,
        'stats.totalPoints': helperPoints + elderlyPoints
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
