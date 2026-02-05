const app = getApp();

Page({
  data: {
    helpers: [],
    filteredHelpers: [],
    keyword: '',
    totalCount: 0,
    totalPoints: 0
  },

  onLoad() {
    this.loadHelpers();
  },

  async loadHelpers() {
    const userInfo = app.globalData.userInfo;
    try {
      const res = await app.request({
        url: '/api/helpers',
        data: { institution_id: userInfo.institution_id }
      });
      
      const totalPoints = res.data.reduce((sum, h) => sum + h.total_points, 0);
      
      this.setData({ 
        helpers: res.data,
        filteredHelpers: res.data,
        totalCount: res.data.length,
        totalPoints
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = this.data.helpers.filter(h => 
      h.name.toLowerCase().includes(keyword)
    );
    this.setData({ 
      keyword,
      filteredHelpers: filtered
    });
  }
});
