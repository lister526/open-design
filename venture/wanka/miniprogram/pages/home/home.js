Page({
  data: { brand: 'Wanka' },
  onShow() {
    const app = getApp();
    this.setData({ brand: (app.globalData.config && app.globalData.config.brand) || 'Wanka' });
  },
  goStudio() { wx.switchTab({ url: '/pages/studio/studio' }); },
  goTemplates() { wx.switchTab({ url: '/pages/templates/templates' }); },
});
