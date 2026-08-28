const { request } = require('../../utils/api.js');

Page({
  data: {
    product: '', audience: '', selling: '', category: '3c',
    langs: ['zh', 'en'], kinds: ['ad_copy', 'video_script', 'image_brief', 'listing'],
    langOpts: ['zh', 'en', 'ja', 'ko', 'es', 'pt', 'ar', 'hi', 'fr'],
    kindOpts: ['ad_copy', 'video_script', 'image_brief', 'listing'],
    kindLabel: { ad_copy: '广告文案', video_script: '短视频脚本', image_brief: '图片指令', listing: '商品描述' },
    assets: [], credits: 0, loading: false,
  },
  onShow() {
    const app = getApp();
    this.setData({ credits: (app.globalData.user && app.globalData.user.credits) || 0 });
  },
  onProduct(e) { this.setData({ product: e.detail.value }); },
  onAudience(e) { this.setData({ audience: e.detail.value }); },
  onSelling(e) { this.setData({ selling: e.detail.value }); },
  toggleLang(e) {
    const v = e.currentTarget.dataset.v; let a = this.data.langs.slice();
    a = a.includes(v) ? a.filter((x) => x !== v) : a.concat(v); this.setData({ langs: a });
  },
  toggleKind(e) {
    const v = e.currentTarget.dataset.v; let a = this.data.kinds.slice();
    a = a.includes(v) ? a.filter((x) => x !== v) : a.concat(v); this.setData({ kinds: a });
  },
  async generate() {
    if (!this.data.product) return wx.showToast({ title: '请填产品名', icon: 'none' });
    const app = getApp();
    if (!app.globalData.token) { wx.switchTab({ url: '/pages/account/account' }); return; }
    this.setData({ loading: true });
    try {
      const r = await request('/generate', { method: 'POST', body: {
        product: this.data.product, title: this.data.product, category: this.data.category,
        audience: this.data.audience, selling_pts: this.data.selling,
        kinds: this.data.kinds, langs: this.data.langs,
      } });
      // stringify each asset for simple display
      const assets = r.assets.map((a) => ({ kind: a.kind, lang: a.lang, text: JSON.stringify(a, null, 2) }));
      if (app.globalData.user) app.globalData.user.credits = r.credits;
      this.setData({ assets, credits: r.credits });
      wx.showToast({ title: '已生成', icon: 'success' });
    } catch (e) {
      if (e.status === 402) wx.showToast({ title: '额度不足', icon: 'none' });
      else wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally { this.setData({ loading: false }); }
  },
});
