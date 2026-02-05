const app = getApp();

Page({
  data: {
    records: [],
    types: ['全部类型', '发放', '兑换'],
    selectedType: '',
    selectedDate: '',
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadRecords();
  },

  async loadRecords(reset = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    if (reset) {
      this.setData({ page: 1, records: [] });
    }

    try {
      const params = {
        page: this.data.page,
        limit: 20
      };
      
      if (this.data.selectedType && this.data.selectedType !== '全部类型') {
        params.type = this.data.selectedType === '发放' ? 'earn' : 'spend';
      }
      
      if (this.data.selectedDate) {
        params.date = this.data.selectedDate;
      }

      const res = await app.request({
        url: '/api/records',
        data: params
      });

      const newRecords = reset ? res.data : [...this.data.records, ...res.data];
      
      this.setData({
        records: newRecords,
        hasMore: res.data.length === 20,
        page: this.data.page + 1
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onTypeChange(e) {
    const type = this.data.types[e.detail.value];
    this.setData({ 
      selectedType: type === '全部类型' ? '' : type 
    });
    this.loadRecords(true);
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.loadRecords(true);
  },

  loadMore() {
    if (this.data.hasMore) {
      this.loadRecords();
    }
  }
});
