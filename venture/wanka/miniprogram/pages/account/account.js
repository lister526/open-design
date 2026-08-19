const { request, setToken } = require('../../utils/api.js');

Page({
  data: { user: null, email: '', password: '', mode: 'register', role: 'merchant' },
  onShow() { const app = getApp(); this.setData({ user: app.globalData.user }); },
  onEmail(e) { this.setData({ email: e.detail.value }); },
  onPassword(e) { this.setData({ password: e.detail.value }); },
  setMode(e) { this.setData({ mode: e.currentTarget.dataset.m }); },
  setRole(e) { this.setData({ role: e.currentTarget.dataset.r }); },
  async submit() {
    if (!this.data.email || !this.data.password) return wx.showToast({ title: '请填邮箱和密码', icon: 'none' });
    try {
      const r = await request('/auth/' + this.data.mode, { method: 'POST', body: {
        email: this.data.email, password: this.data.password, role: this.data.role, lang: 'zh',
      } });
      setToken(r.token);
      getApp().globalData.user = r.user;
      this.setData({ user: r.user });
      wx.showToast({ title: '欢迎！', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    }
  },
  logout() { setToken(''); getApp().globalData.user = null; this.setData({ user: null }); },
  // WeChat one-tap login (production): exchange wx.login code with backend /api/auth/wx
  wxLogin() {
    wx.login({ success: (res) => {
      wx.showToast({ title: '接入 /api/auth/wx 后可用 code=' + (res.code || '').slice(0, 6) + '…', icon: 'none' });
    } });
  },
});
