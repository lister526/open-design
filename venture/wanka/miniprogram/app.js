// WeChat Mini Program entry. Shares the SAME REST API as web/mobile.
const { API_BASE } = require('./utils/config.js');

App({
  globalData: {
    apiBase: API_BASE,
    token: '',
    user: null,
    config: null,
  },
  onLaunch() {
    const token = wx.getStorageSync('wk_token');
    if (token) this.globalData.token = token;
    // preload public config (kinds, langs, ad config, brand)
    const { request } = require('./utils/api.js');
    request('/config').then((cfg) => { this.globalData.config = cfg; }).catch(() => {});
    if (token) request('/me').then((r) => { this.globalData.user = r.user; }).catch(() => { wx.removeStorageSync('wk_token'); });
  },
});
