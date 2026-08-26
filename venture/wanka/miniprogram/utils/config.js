// ================= 微信小程序 API 配置 =================
// 1) 把 API_BASE 改成你部署后的 HTTPS 域名（必须是已备案的自有域名 + HTTPS）。
//    ⚠️ 微信不允许使用 localhost，也不允许直接用 *.workers.dev 作为生产 request 域名。
//    你需要给 Cloudflare Worker 绑定一个自有域名（见 docs/LAUNCH_WECHAT.md）。
// 2) 在「微信公众平台 → 开发管理 → 开发设置 → 服务器域名」里，
//    把这个域名加入 "request 合法域名"。
// 3) 本地真机预览可临时在开发者工具里勾选「不校验合法域名」（仅开发用，不能上架）。
const API_BASE = 'https://wanka.app';
module.exports = { API_BASE };
