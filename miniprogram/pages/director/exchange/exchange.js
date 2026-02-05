const app = getApp();

Page({
  data: {
    selectedType: '',
    persons: [],
    selectedPerson: null,
    products: [],
    cart: {},
    totalPoints: 0,
    selectedCount: 0
  },

  onLoad() {
    this.loadProducts();
  },

  async loadProducts() {
    try {
      const res = await app.request({ 
        url: '/api/products',
        data: { status: 1 }
      });
      this.setData({ products: res.data });
    } catch (error) {
      wx.showToast({ title: '加载商品失败', icon: 'none' });
    }
  },

  async selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 
      selectedType: type,
      selectedPerson: null,
      cart: {},
      totalPoints: 0,
      selectedCount: 0
    });
    this.loadPersons(type);
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
      cart: {},
      totalPoints: 0,
      selectedCount: 0
    });
    // 重置商品选择状态
    const products = this.data.products.map(p => ({ ...p, selected: false }));
    this.setData({ products });
  },

  selectProduct(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    
    if (product.stock_quantity === 0) return;

    const products = this.data.products.map(p => {
      if (p.id === id) {
        return { ...p, selected: !p.selected };
      }
      return p;
    });

    const cart = { ...this.data.cart };
    if (!product.selected) {
      cart[id] = 1;
    } else {
      delete cart[id];
    }

    this.setData({ products, cart });
    this.calculateTotal();
  },

  changeQuantity(e) {
    const { id, delta } = e.currentTarget.dataset;
    const product = this.data.products.find(p => p.id === id);
    const currentQty = this.data.cart[id] || 0;
    const newQty = currentQty + parseInt(delta);

    if (newQty <= 0) {
      const cart = { ...this.data.cart };
      delete cart[id];
      const products = this.data.products.map(p => 
        p.id === id ? { ...p, selected: false } : p
      );
      this.setData({ cart, products });
    } else if (newQty <= product.stock_quantity) {
      this.setData({ 
        cart: { ...this.data.cart, [id]: newQty }
      });
    }
    this.calculateTotal();
  },

  calculateTotal() {
    let total = 0;
    let count = 0;
    Object.entries(this.data.cart).forEach(([id, qty]) => {
      const product = this.data.products.find(p => p.id == id);
      if (product) {
        total += product.points_price * qty;
        count++;
      }
    });
    this.setData({ totalPoints: total, selectedCount: count });
  },

  stopPropagation() {},

  canSubmit() {
    const { selectedPerson, totalPoints } = this.data;
    return selectedPerson && totalPoints > 0 && selectedPerson.total_points >= totalPoints;
  },

  async submitExchange() {
    if (!this.canSubmit()) {
      wx.showToast({ title: '无法兑换', icon: 'none' });
      return;
    }

    const { selectedPerson, selectedType, cart, totalPoints } = this.data;
    const items = Object.entries(cart).map(([product_id, quantity]) => ({
      product_id: parseInt(product_id),
      quantity
    }));

    wx.showModal({
      title: '确认兑换',
      content: `确定扣除${totalPoints}积分兑换这些商品吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await app.request({
              url: '/api/exchange',
              method: 'POST',
              data: {
                target_type: selectedType,
                target_id: selectedPerson.id,
                items
              }
            });

            wx.showToast({
              title: `兑换成功，剩余${result.data.remaining_points}分`,
              icon: 'none',
              duration: 2000
            });

            // 重置
            this.setData({
              selectedPerson: null,
              cart: {},
              totalPoints: 0,
              selectedCount: 0
            });
            this.loadProducts();
          } catch (error) {
            wx.showToast({ title: error.message || '兑换失败', icon: 'none' });
          }
        }
      }
    });
  }
});
