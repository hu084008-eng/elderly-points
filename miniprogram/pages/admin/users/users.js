const app = getApp();

Page({
  data: {
    users: []
  },

  onLoad() {
    this.loadUsers();
  },

  async loadUsers() {
    try {
      const res = await app.request({ 
        url: '/api/users',
        data: { role: 'director' }
      });
      this.setData({ users: res.data });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async resetPassword(e) {
    const id = e.currentTarget.dataset.id;
    const user = this.data.users.find(u => u.id === id);
    
    wx.showModal({
      title: '重置密码',
      content: `确定重置 ${user.name} 的密码吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({
              url: `/api/users/${id}/reset-password`,
              method: 'POST'
            });
            wx.showToast({ 
              title: '密码已重置为123456', 
              icon: 'none',
              duration: 2000
            });
          } catch (error) {
            wx.showToast({ title: '重置失败', icon: 'none' });
          }
        }
      }
    });
  },

  async deleteUser(e) {
    const id = e.currentTarget.dataset.id;
    const user = this.data.users.find(u => u.id === id);
    
    wx.showModal({
      title: '确认删除',
      content: `确定删除 ${user.name} 的账号吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({
              url: `/api/users/${id}`,
              method: 'DELETE'
            });
            wx.showToast({ title: '删除成功' });
            this.loadUsers();
          } catch (error) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
