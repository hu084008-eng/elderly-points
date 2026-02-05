const app = getApp();

Page({
  data: {
    rules: [],
    showModal: false,
    form: {
      code: '',
      name: '',
      points_per_hour: 1,
      description: ''
    }
  },

  onLoad() {
    this.loadRules();
  },

  async loadRules() {
    try {
      const res = await app.request({ url: '/api/service-rules' });
      this.setData({ rules: res.data });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  changePoints(e) {
    const { id, delta } = e.currentTarget.dataset;
    const rules = this.data.rules.map(rule => {
      if (rule.id === id) {
        const newPoints = Math.max(1, rule.points_per_hour + parseInt(delta));
        this.updateRule(id, { points_per_hour: newPoints });
        return { ...rule, points_per_hour: newPoints };
      }
      return rule;
    });
    this.setData({ rules });
  },

  async toggleStatus(e) {
    const { id } = e.currentTarget.dataset;
    const status = e.detail.value ? 1 : 0;
    try {
      await app.request({
        url: `/api/service-rules/${id}`,
        method: 'PUT',
        data: { status }
      });
      wx.showToast({ title: '更新成功' });
    } catch (error) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  async updateRule(id, data) {
    try {
      await app.request({
        url: `/api/service-rules/${id}`,
        method: 'PUT',
        data
      });
    } catch (error) {
      console.error('更新失败', error);
    }
  },

  showAddModal() {
    this.setData({ 
      showModal: true,
      form: { code: '', name: '', points_per_hour: 1, description: '' }
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  onCodeInput(e) {
    this.setData({ 'form.code': e.detail.value });
  },

  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value });
  },

  onPointsInput(e) {
    this.setData({ 'form.points_per_hour': parseInt(e.detail.value) || 1 });
  },

  onDescInput(e) {
    this.setData({ 'form.description': e.detail.value });
  },

  async addRule() {
    const { code, name, points_per_hour, description } = this.data.form;
    if (!code || !name) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      await app.request({
        url: '/api/service-rules',
        method: 'POST',
        data: { code, name, points_per_hour, description, status: 1 }
      });
      wx.showToast({ title: '添加成功' });
      this.hideModal();
      this.loadRules();
    } catch (error) {
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  }
});
