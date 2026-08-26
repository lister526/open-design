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

  // WeChat one-tap login (production): exchange wx.login code with backend /api/auth/wx.
  // Requires WX_APPID + WX_SECRET set as Worker secrets, and the request domain added to
  // 小程序后台 → 开发管理 → 服务器域名 (request 合法域名). Localhost/workers.dev not allowed.
  wxLogin() {
    wx.login({
      success: async (res) => {
        if (!res.code) return wx.showToast({ title: '获取 code 失败', icon: 'none' });
        wx.showLoading({ title: '登录中…' });
        try {
          // optional: fetch nickname/avatar via wx.getUserProfile (must be user-triggered)
          const r = await request('/auth/wx', { method: 'POST', body: { code: res.code } });
          setToken(r.token);
          getApp().globalData.user = r.user;
          this.setData({ user: r.user });
          wx.hideLoading();
          wx.showToast({ title: '欢迎！', icon: 'success' });
        } catch (e) {
          wx.hideLoading();
          const msg = e.message === 'wx_not_configured'
            ? '后端未配置微信登录（WX_APPID/WX_SECRET）'
            : (e.message || '登录失败');
          wx.showToast({ title: msg, icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '微信登录失败', icon: 'none' }),
    });
  },

  // 导出我的数据（合规）
  async exportData() {
    try {
      const data = await request('/me/export');
      wx.showModal({ title: '数据导出成功', content: '账户 + ' + ((data.projects || []).length) + ' 个项目 + ' + ((data.assets || []).length) + ' 条素材。', showCancel: false });
    } catch (e) { wx.showToast({ title: e.message || '失败', icon: 'none' }); }
  },

  // 注销账户（永久删除，合规必备）
  deleteAccount() {
    wx.showModal({
      title: '注销账户',
      content: '将永久删除你的账户与全部数据，且不可恢复。确定继续？',
      confirmText: '永久删除',
      confirmColor: '#ff6b6b',
      success: async (m) => {
        if (!m.confirm) return;
        try {
          await request('/me', { method: 'DELETE', body: { confirm: true } });
          setToken(''); getApp().globalData.user = null; this.setData({ user: null });
          wx.showToast({ title: '账户已注销', icon: 'success' });
        } catch (e) { wx.showToast({ title: e.message || '失败', icon: 'none' }); }
      },
    });
  },
});
