const { request } = require('../../utils/api.js');

Page({
  data: {
    list: [], kind: '',
    kindOpts: ['', 'ad_copy', 'video_script', 'image_brief', 'listing'],
    kindLabel: { '': '全部', ad_copy: '广告文案', video_script: '短视频脚本', image_brief: '图片指令', listing: '商品描述' },
  },
  onShow() { this.load(); },
  setKind(e) { this.setData({ kind: e.currentTarget.dataset.v }, () => this.load()); },
  async load() {
    try {
      const q = this.data.kind ? ('?kind=' + this.data.kind) : '';
      const r = await request('/templates' + q);
      this.setData({ list: r.templates });
    } catch (e) { /* ignore */ }
  },
  async use(e) {
    const tp = this.data.list[e.currentTarget.dataset.i];
    const app = getApp();
    if (!app.globalData.token) { wx.switchTab({ url: '/pages/account/account' }); return; }
    const that = this;
    wx.showModal({
      title: '用模板生成', editable: true, placeholderText: '输入你的产品名称',
      success: async (res) => {
        if (!res.confirm || !res.content) return;
        try {
          await request('/templates/' + tp.id + '/use', { method: 'POST', body: { product: res.content, title: res.content, lang: 'zh' } });
          wx.showToast({ title: '已生成，去创作台查看', icon: 'none' });
        } catch (err) {
          wx.showToast({ title: err.status === 402 ? '额度不足' : (err.message || '失败'), icon: 'none' });
        }
      },
    });
  },
});
