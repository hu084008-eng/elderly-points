const app = getApp();

Page({
  data: {
    personTypes: [{ id: 'helper', name: '护工' }, { id: 'elderly', name: '老人' }],
    selectedType: '',
    selectedTypeName: '',
    persons: [],
    selectedPerson: null,
    selectedPersonName: '',
    rules: [],
    selectedRule: null,
    selectedRuleName: '',
    duration: 1,
    imageUrl: '',
    remark: ''
  },

  onLoad() {
    this.loadRules();
  },

  async loadRules() {
    try {
      const res = await app.request({ url: '/api/service-rules?status=1' });
      this.setData({ rules: res.data });
    } catch (error) {
      console.error('加载规则失败', error);
    }
  },

  async onTypeChange(e) {
    const index = e.detail.value;
    const type = this.data.personTypes[index];
    this.setData({
      selectedType: type.id,
      selectedTypeName: type.name,
      selectedPerson: null,
      selectedPersonName: ''
    });
    this.loadPersons(type.id);
  },

  async loadPersons(type) {
    const userInfo = app.globalData.userInfo;
    try {
      const res = await app.request({
        url: '/api/persons',
        data: {
          institution_id: userInfo.institution_id,
          type: type
        }
      });
      const persons = res.data.map(p => ({
        ...p,
        displayName: `${p.name} - 当前${p.total_points}分`
      }));
      this.setData({ persons });
    } catch (error) {
      wx.showToast({ title: '加载人员失败', icon: 'none' });
    }
  },

  onPersonChange(e) {
    const index = e.detail.value;
    const person = this.data.persons[index];
    this.setData({
      selectedPerson: person,
      selectedPersonName: person.name
    });
  },

  onRuleChange(e) {
    const index = e.detail.value;
    const rule = this.data.rules[index];
    this.setData({
      selectedRule: rule,
      selectedRuleName: rule.name
    });
  },

  onDurationChange(e) {
    this.setData({ duration: e.detail.value });
  },

  calculatePoints() {
    const { selectedRule, duration } = this.data;
    if (!selectedRule || !duration) return 0;
    return Math.round(duration * selectedRule.points_per_hour);
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        // 上传图片到服务器
        this.uploadImage(res.tempFiles[0].tempFilePath);
      }
    });
  },

  uploadImage(filePath) {
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/api/upload`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        this.setData({ imageUrl: data.data.url });
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  canSubmit() {
    const { selectedPerson, selectedRule, duration, imageUrl } = this.data;
    return selectedPerson && selectedRule && duration && imageUrl;
  },

  async submitGrant() {
    if (!this.canSubmit()) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const { selectedPerson, selectedRule, duration, imageUrl, remark } = this.data;
    
    try {
      const res = await app.request({
        url: '/api/grant',
        method: 'POST',
        data: {
          target_type: this.data.selectedType,
          target_id: selectedPerson.id,
          service_rule_id: selectedRule.id,
          duration_hours: duration,
          description: remark,
          image_url: imageUrl
        }
      });

      wx.showToast({
        title: `发放成功，${res.data.target_name}当前${res.data.current_balance}分`,
        icon: 'none',
        duration: 2000
      });

      // 重置表单
      this.setData({
        selectedPerson: null,
        selectedPersonName: '',
        selectedRule: null,
        selectedRuleName: '',
        duration: 1,
        imageUrl: '',
        remark: ''
      });
    } catch (error) {
      wx.showToast({ title: error.message || '发放失败', icon: 'none' });
    }
  }
});
