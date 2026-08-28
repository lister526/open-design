// Shared API client for the Mini Program. Mirrors web app.js api().
const { API_BASE } = require('./config.js');

function request(path, { method = 'GET', body } = {}) {
  const app = getApp && getApp();
  const token = (app && app.globalData && app.globalData.token) || wx.getStorageSync('wk_token');
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/api' + path,
      method,
      data: body || undefined,
      header: Object.assign(
        { 'Content-Type': 'application/json' },
        token ? { Authorization: 'Bearer ' + token } : {},
      ),
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(Object.assign(new Error((res.data && res.data.error) || ('http_' + res.statusCode)), { data: res.data, status: res.statusCode }));
      },
      fail(err) { reject(err); },
    });
  });
}

function setToken(token) {
  const app = getApp && getApp();
  if (app && app.globalData) app.globalData.token = token || '';
  if (token) wx.setStorageSync('wk_token', token); else wx.removeStorageSync('wk_token');
}

module.exports = { request, setToken };
