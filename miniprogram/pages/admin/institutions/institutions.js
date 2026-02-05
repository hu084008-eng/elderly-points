const app = getApp();

Page({
  data: {
    institutions: [],
    showModal: false,
    isEdit: false,
    editingId: null,
    form: {
      name: '',
      address: '',
      contact_person: '',
      contact_phone: '',
      director_username: '',
      director_password: ''
    }
  },

  onLoad() {
    this.loadInstitutions();
  },

  async loadInstitutions() {
    try {
      const res = await app.request({ url: '/api/institutions' });
      this.setData({ institutions: res.data });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      editingId: null,
      form: { name: '', address: '', contact_person: '', contact_phone: '', director_username: '', director_password: '' }
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  onNameInput(e) { this.setData({ 'form.name': e.detail.value }); },
  onAddressInput(e) { this.setData({ 'form.address': e.detail.value }); },
  onContactInput(e) { this.setData({ 'form.contact_person': e.detail.value }); },
  onPhoneInput(e) { this.setData({ 'form.contact_phone': e.detail.value }); },
  onUsernameInput(e) { this.setData({ 'form.director_username': e.detail.value }); },
  onPasswordInput(e) { this.setData({ 'form.director_password': e.detail.value }); },

  editInstitution(e) {
    const id = e.currentTarget.dataset.id;
    const institution = this.data.institutions.find(i => i.id === id);
    this.setData({
      showModal: true,
      isEdit: true,
      editingId: id,
      form: {
        name: institution.name,
        address: institution.address,
        contact_person: institution.contact_person,
        contact_phone: institution.contact_phone
      }
    });
  },

  async saveInstitution() {
    const { form, isEdit, editingId } = this.data;
    if (!form.name) {
      wx.showToast({ title: '请输入院点名称', icon: 'none' });
      return;
    }

    try {
      if (isEdit) {
        await app.request({
          url: `/api/institutions/${editingId}`,
          method: 'PUT',
          data: form
        });
        wx.showToast({ title: '更新成功' });
      } else {
        await app.request({
          url: '/api/institutions',
          method: 'POST',
          data: form
        });
        wx.showToast({ title: '创建成功' });
      }
      this.hideModal();
      this.loadInstitutions();
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    }
  },

  async resetPassword(e) {
    const id = e.currentTarget.dataset.id;
    const institution = this.data.institutions.find(i => i.id === id);
    
    wx.showModal({
      title: '重置密码',
      content: `确定重置 ${institution.name} 院长的密码吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({
              url: `/api/institutions/${id}/reset-password`,
              method: 'POST'
            });
            wx.showToast({ title: '密码已重置为123456', icon: 'none' });
          } catch (error) {
            wx.showToast({ title: '重置失败', icon: 'none' });
          }
        }
      }
    });
  },

  async deleteInstitution(e) {
    const id = e.currentTarget.dataset.id;
    const institution = this.data.institutions.find(i => i.id === id);
    
    wx.showModal({
      title: '删除确认',
      content: `删除 ${institution.name} 将同时删除院长账号，确定吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({
              url: `/api/institutions/${id}`,
              method: 'DELETE'
            });
            wx.showToast({ title: '删除成功' });
            this.loadInstitutions();
          } catch (error) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
