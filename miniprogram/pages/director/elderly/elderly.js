const app = getApp();

Page({
  data: {
    elderly: [],
    filteredElderly: [],
    keyword: '',
    totalCount: 0,
    totalPoints: 0
  },

  onLoad() {
    this.loadElderly();
  },

  async loadElderly() {
    const userInfo = app.globalData.userInfo;
    try {
      const res = await app.request({
        url: '/api/elderly',
        data: { institution_id: userInfo.institution_id }
      });
      
      const totalPoints = res.data.reduce((sum, e) => sum + e.total_points, 0);
      
      this.setData({ 
        elderly: res.data,
        filteredElderly: res.data,
        totalCount: res.data.length,
        totalPoints
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = this.data.elderly.filter(e => 
      e.name.toLowerCase().includes(keyword)
    );
    this.setData({ 
      keyword,
      filteredElderly: filtered
    });
  }
});
