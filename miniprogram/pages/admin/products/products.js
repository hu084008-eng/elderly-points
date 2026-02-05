const app = getApp();

Page({
  data: {
    products: [],
    filteredProducts: [],
    categories: ['清洁用品', '食品', '日用品', '其他'],
    activeCategory: 'all',
    showModal: false,
    isEdit: false,
    editingId: null,
    form: {
      name: '',
      category: '',
      points_price: '',
      stock_quantity: '',
      unit: '',
      status: 1
    }
  },

  onLoad() {
    this.loadProducts();
  },

  async loadProducts() {
    try {
      const res = await app.request({ url: '/api/products' });
      this.setData({ 
        products: res.data,
        filteredProducts: res.data
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    const filtered = category === 'all' 
      ? this.data.products 
      : this.data.products.filter(p => p.category === category);
    this.setData({ 
      activeCategory: category,
      filteredProducts: filtered
    });
  },

  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      editingId: null,
      form: { name: '', category: '', points_price: '', stock_quantity: '', unit: '', status: 1 }
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  onNameInput(e) { this.setData({ 'form.name': e.detail.value }); },
  onPointsInput(e) { this.setData({ 'form.points_price': parseInt(e.detail.value) || 0 }); },
  onStockInput(e) { this.setData({ 'form.stock_quantity': parseInt(e.detail.value) || 0 }); },
  onUnitInput(e) { this.setData({ 'form.unit': e.detail.value }); },
  onCategoryChange(e) {
    this.setData({ 'form.category': this.data.categories[e.detail.value] });
  },
  onStatusChange(e) {
    this.setData({ 'form.status': e.detail.value ? 1 : 0 });
  },

  editProduct(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    this.setData({
      showModal: true,
      isEdit: true,
      editingId: id,
      form: { ...product }
    });
  },

  async saveProduct() {
    const { form, isEdit, editingId } = this.data;
    if (!form.name || !form.category) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      if (isEdit) {
        await app.request({
          url: `/api/products/${editingId}`,
          method: 'PUT',
          data: form
        });
      } else {
        await app.request({
          url: '/api/products',
          method: 'POST',
          data: form
        });
      }
      wx.showToast({ title: '保存成功' });
      this.hideModal();
      this.loadProducts();
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async toggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.detail.value ? 1 : 0;
    try {
      await app.request({
        url: `/api/products/${id}`,
        method: 'PUT',
        data: { status }
      });
      this.loadProducts();
    } catch (error) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  async deleteProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({
              url: `/api/products/${id}`,
              method: 'DELETE'
            });
            wx.showToast({ title: '删除成功' });
            this.loadProducts();
          } catch (error) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
