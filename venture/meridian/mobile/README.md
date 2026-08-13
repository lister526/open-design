# 子午·合盘 Meridian Sync — 移动 App (Expo / React Native)

东方星命「合盘/缘分」关系产品的官方移动端。与网站共用同一套后端 API 与
**同一份 8 国语言词典**（实时切换 + 阿拉伯语 RTL），文案为「地道本地化」，非机翻。

支持语言：简体中文 / English / 日本語 / 한국어 / हिन्दी（印地语）/ Español / Português(BR) / العربية(RTL)。

---

## 1. 目录结构

```
mobile/
├─ App.js                      # 根组件：Provider + 导航
├─ index.js                    # registerRootComponent
├─ app.json                    # Expo 配置（含 extra.apiBaseUrl —— 必须改）
├─ package.json                # 依赖
├─ babel.config.js
└─ src/
   ├─ i18n/
   │  ├─ dictionary.js         # 8 语言 × 191 键（由网站词典生成，勿手改）
   │  └─ index.js              # I18nProvider / useI18n / RTL / 持久化
   ├─ lib/
   │  ├─ api.js                # 后端 API 客户端（token / apiBaseUrl）
   │  └─ auth.js               # 登录态 Context
   ├─ theme/index.js           # 设计变量（与网站同色系）
   ├─ components/              # UI 组件（LangSwitcher / TrustBar / WhyGrid …）
   └─ screens/                # 页面（Home / Funnel / Report / Paywall / Auth / Account）
```

## 2. 一步到位跑起来（3 步）

```bash
cd mobile
npm install            # 或 yarn
npx expo start         # 扫码用 Expo Go 预览；或 i / a 打开模拟器
```

> 首次要装 Expo CLI：`npm i -g expo`（可选，npx 也行）。

## 3. ⚠️ 上线前必须改 1 处：后端地址

打开 `app.json`，把 `expo.extra.apiBaseUrl` 改成你部署好的 Cloudflare
Worker 地址（网站后端）：

```json
"extra": { "apiBaseUrl": "https://你的worker.workers.dev" }
```

App 的注册/登录/合盘/解锁/支付全部走这个后端——和网站是同一套，
数据互通，用户在网页买的会员、报告，在 App 里同样解锁。

## 4. 打包上架（赚钱关键）

用 EAS（Expo 官方云构建，免本机 Xcode/Android Studio）：

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android        # 产出 .aab，上传 Google Play
eas build -p ios            # 产出 .ipa，上传 App Store（需 Apple 开发者账号 $99/yr）
```

上架清单：
- **Google Play**：一次性 $25，1~3 天审核。
- **App Store**：$99/年，审核较严——注意内购合规（见下）。
- 图标 / 启动图放 `assets/`（已在 app.json 声明占位，替换成你的品牌图）。

## 5. 支付合规（务必读）

- 后端 `PAYMENTS_MOCK` 打开时是**演示模式**，点购买只创建 pending 订单、
  不发放权益。上线真实收款前，请在后端接入真实支付渠道
  （Stripe / 微信 / 支付宝），权益只由**签名校验过的 webhook**发放。
- iOS：**数字商品必须走 Apple 内购（IAP）**，否则会被拒。若只在 Web 收款，
  App 内不要出现"购买"按钮跳转外部支付（或改用 IAP / RevenueCat）。
  Android 相对宽松，但 Google Play 同样要求数字内容用 Play Billing。
- 建议策略：**网页端主收款（费率低），App 引流 + 免费预览 + 会员权益同步**，
  规避商店抽成，最快回本。

## 6. 语言与本地化

- 词典 `src/i18n/dictionary.js` 由网站 `public/i18n.js` 生成，**改文案请改网站那份再同步**，
  保证两端完全一致、不产生翻译漂移。
- 阿拉伯语自动切 RTL（`I18nManager.forceRTL`）。原生端切换 RTL 后，布局方向
  需重启 App 才完全生效（数字/分数保持 LTR，已处理）。

## 7. 变现阶梯（与后端一致）

| 档位 | 价格(示例, 人民币) | 内容 |
|---|---|---|
| 免费 | ¥0 | 注册送 3 次解锁额度；总分+关键词+钩子 |
| 精析报告 | ¥19 | 单份完整合盘（优势/摩擦/相处建议/择时）|
| 会员(月) | ¥39/月 | 不限次解锁 + 优先 |
| 会员(年) | ¥299/年 | 最划算 |
| 婚配深度 | ¥399 | 长期关系深度报告 |

各语言价格已在词典 `PRICES` 里按当地习惯本地化（$ / ₹ / ₩ / R$ …）。
