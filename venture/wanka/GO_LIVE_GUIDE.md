# 🚀 万卡 Wanka · 傻瓜式上架总手册（5 平台）

> 这份手册假设你**完全不懂技术**。每一步都告诉你「点哪里、填什么、粘什么」。
> 遇到看不懂的名词，直接照抄命令/照着点就行。

---

## ⏱️ 先看这个：哪些能"下周上线"，哪些不行（诚实说明）

| 平台 | 你的代码 | 能否"下周"真正上线 | 卡点（平台方规定，谁都绕不过） |
|---|---|---|---|
| **独立站（网页）** | ✅ 100% 就绪 | ✅ **可以，1 小时内** | 无。跑 `deploy.sh` 即上线 |
| **微信小程序** | ✅ 就绪 | ⚠️ 看备案速度 | 需**已备案的自有 HTTPS 域名** + **AI 功能算法备案**；备案通常 3–20 天 |
| **iOS App Store** | ✅ 就绪 | ⚠️ 约 3–7 天 | 需 Apple 开发者账号（$99/年，审核 1–2 天）+ App 审核（1–3 天）|
| **Google Play** | ✅ 就绪 | ❌ **最快也要 14 天** | 个人号**强制**：12 个测试员 × **连续 14 天**封闭测试后才能上生产（硬性，无法加速）|
| **AppLovin 广告** | ✅ 就绪 | ⚠️ 看审核 | AppLovin 账号需先审核通过（通常 1–3 天）|

**结论：网页独立站下周绝对能上并开始引流赚钱。App 商店受各平台审核/测试期限制，代码已 100% 备好，一旦平台放行你当天就能提交。** 建议策略：**先用独立站抢跑营销，App 并行走审核流程。**

---

## 🌟 第 0 步：让网站"绝不失效"（最重要，先做这个）

沙盒预览网址（`*.sandbox.novita.ai`）会在沙盒重启后失效——这是它的天性，不是 bug。
**真正 24 小时不失效的唯一办法，是部署到 Cloudflare（免费、全球、永远在线）。**

### 傻瓜三步：
1. 注册一个免费 Cloudflare 账号：https://dash.cloudflare.com/sign-up
2. 打开电脑终端，进入项目文件夹 `venture/wanka`，运行：
   ```bash
   bash deploy.sh
   ```
3. 按提示操作（会弹出浏览器让你点"授权"，其余全自动）。

跑完后，你会得到一个**永久在线**的网址，形如 `https://wanka.你的账号.workers.dev`。
这个网址**沙盒关了也不会挂**，可以直接拿去做广告、发朋友圈、投流。

> 💡 之后每次改了代码，只要再跑一次 `bash deploy.sh` 就更新上线。

---

## 🏷️ 第 0.5 步：绑定你自己的域名（强烈建议，微信上架也需要）

自有域名（如 `wanka.app`）让你更专业，而且**微信小程序上架强制要求已备案的自有 HTTPS 域名**。

1. 在任意域名商买一个域名（阿里云/腾讯云/GoDaddy，约 ¥50–100/年）。
   - **要上微信小程序：必须在中国大陆做 ICP 备案**（用腾讯云/阿里云买域名，按引导提交备案，3–20 天）。
2. 把域名加到 Cloudflare（Cloudflare 首页 → Add a site → 按引导改 DNS）。
3. 绑定到 Worker：Cloudflare 控制台 → Workers & Pages → 你的 `wanka` → Settings → Domains & Routes → Add Custom Domain → 填 `wanka.app`。
4. 改两个文件里的域名，然后重新 `bash deploy.sh`：
   - `miniprogram/utils/config.js` 的 `API_BASE`
   - `mobile/app.json` 里 `extra.apiBaseUrl`

---

## 📱 平台一：iOS App Store

**准备**：一台 Mac（或用 EAS 云构建，不用 Mac）；Apple 开发者账号 $99/年。

### 步骤
1. 注册 Apple Developer：https://developer.apple.com/programs/ （审核 1–2 天）。
2. 装工具并登录 Expo（免费）：
   ```bash
   cd mobile
   npm install
   npm install -g eas-cli
   eas login
   eas build:configure
   ```
3. 云构建 iOS 包（**不需要 Mac**，Expo 帮你在云端打包）：
   ```bash
   eas build --platform ios --profile production
   ```
   首次会问你要不要自动管理证书 → 选 **Yes**，全自动。
4. 提交到 App Store：
   ```bash
   eas submit --platform ios --latest
   ```
5. 去 App Store Connect（https://appstoreconnect.apple.com）填 App 信息：
   - 名称、副标题、截图（用手机截几张 App 界面即可）
   - **隐私政策网址**：填 `https://你的域名/privacy`（必填）
   - **App 隐私问卷**：如实勾选"收集邮箱、使用数据用于广告"
6. 提交审核 → 通常 1–3 天。

### ⚠️ iOS 三大避雷（不做必被拒）
- ✅ **应用内删除账户**：已内置（"我的"页 → 永久删除账户）。这是 Apple 5.1.1(v) 强制项。
- ✅ **卖额度/会员必须用苹果内购（IAP）**，不能用网页支付。**详见 `docs/IAP_COMPLIANCE.md`（上架前照着改）**。
- ✅ **AI App 要说明数据怎么处理**：隐私问卷里如实填写。

---

## 🤖 平台二：Google Play（安卓）

**准备**：Google Play 开发者账号 $25（一次性）。

### 🔴 最重要的事：14 天封闭测试（硬性规定）
2023-11-13 之后注册的**个人开发者账号**，上生产前**必须**：
> 招募 **≥12 名测试员**，他们**连续 14 天**保持加入你的封闭测试轨道。

这是 Google 官方规定，**无法花钱加速、无法跳过**。所以**今天就要开始**，14 天后才能上架。

### 步骤
1. 注册：https://play.google.com/console/signup （$25，个人号需身份验证，1–2 天）。
2. 云构建安卓包：
   ```bash
   cd mobile
   eas build --platform android --profile production
   ```
   得到一个 `.aab` 文件。
3. Play Console → 创建应用 → 填名称/分类/隐私政策网址。
4. **立刻开测试**：左侧 Testing → **Closed testing** → 建一个轨道 → 上传 `.aab`。
5. **拉满 12 个测试员**：把测试链接发给 12 个亲友/同事，让他们点链接、装上、**14 天别卸载**。
   - 找不齐人？可用互测社区（搜 "Google Play 12 testers"），几十块能凑齐。
6. 满 14 天 + 12 人后：Play Console 会出现 "Apply for production" → 点它申请转正 → Google 审核后上生产。

### ⚠️ 安卓避雷
- ✅ 账户删除入口同样必须有（已内置）。
- ✅ 数据安全表单（Data safety）如实填写。
- ✅ 广告 ID 权限已在 `app.json` 声明。

---

## 💬 平台三：微信小程序

**准备**：微信小程序账号（个人/企业主体）；已备案自有 HTTPS 域名。

### 🔴 两个硬门槛（AI 类小程序尤其严）
1. **服务器域名必须是已 ICP 备案的自有域名 + HTTPS**（不能用 workers.dev/localhost）。→ 见第 0.5 步。
2. **AI 生成功能需要"算法备案 / 深度合成"资质**：在小程序类目里选到 AI 相关类目时，微信会要求提供**算法备案号**。
   - 个人主体可选类目受限，**AI 内容生成建议用企业主体**。
   - 算法备案在「互联网信息服务算法备案系统」办理，需要时间，**尽早开始**。

### 步骤
1. 注册小程序：https://mp.weixin.qq.com → 选主体（企业更顺）。
2. 拿到 **AppID** 和 **AppSecret**（开发 → 开发管理 → 开发设置）。
3. 把这两个设成后端密钥（让微信一键登录生效）：
   ```bash
   cd venture/wanka
   npx wrangler secret put WX_APPID     # 粘贴 AppID
   npx wrangler secret put WX_SECRET    # 粘贴 AppSecret
   ```
   然后重新 `bash deploy.sh`。
4. 配置服务器域名：小程序后台 → 开发 → 开发设置 → 服务器域名 → **request 合法域名**里加你的 `https://你的域名`。
5. 用**微信开发者工具**打开 `venture/wanka/miniprogram` 文件夹，填入 AppID。
6. `miniprogram/utils/config.js` 的 `API_BASE` 改成你的域名，保存。
7. 开发者工具里点「预览」用手机扫码自测 → 没问题点「上传」→ 后台「提交审核」。

### ⚠️ 微信避雷
- ✅ 小程序内已提供**账户注销 + 数据导出**（"我的"页）。
- ✅ 需要《隐私保护指引》：后台按引导填写，勾选收集的信息（邮箱、生成内容）。
- ⚠️ 本地真机调试可临时勾选"不校验合法域名"，但**上架必须用备案域名**。

---

## 📺 平台四：AppLovin（广告变现）

**作用**：给免费用户看激励广告，用户看完广告换创作额度（你赚广告钱）。已全部接好，只差填 Key。

### 步骤
1. 注册并等审核：https://www.applovin.com/ → 创建账号（通常 1–3 天审核）。
2. 后台创建应用 + **Rewarded（激励视频）广告单元**，拿到：
   - `SDK Key`
   - `Rewarded Ad Unit ID`
3. 填到两处：
   - **后端** `venture/wanka/wrangler.toml` 的 `[vars]`：`APPLOVIN_SDK_KEY`、`APPLOVIN_REWARDED_UNIT`
   - **移动端** `mobile/app.json` 的 `extra`：`applovinSdkKey`、`applovinRewardedUnit`
4. 设置服务端回调密钥（防刷）：
   ```bash
   cd venture/wanka
   npx wrangler secret put APPLOVIN_S2S_SECRET   # 自己随便设一串，记住它
   ```
5. AppLovin 后台 → 你的应用 → **Rewarded Callback（S2S）** 填：
   ```
   https://你的域名/api/ads/applovin/s2s?user_id={USER_ID}&amount={AMOUNT}&event_id={EVENT_ID}&secret=你刚设的密钥
   ```
6. 移动端装 SDK 并重新构建：
   ```bash
   cd mobile
   npx expo install react-native-applovin-max
   eas build --platform android --profile production   # iOS 同理
   ```
7. 重新 `bash deploy.sh`。完成后："我的"页的「看广告免费领额度」按钮就是真实广告了。

> 💡 没填 Key 时，App 里的"看广告"会走**演示模式**（直接发额度），方便你先跑通流程。
> 建议在 AppLovin 后台把 **Meta Audience Network** 加为中介，Meta 广告需求会自动进来，收益更高。

---

## 🌐 平台五：独立站营销引流（最快见钱，先干这个）

独立站 = 第 0 步部署好的那个网址。它已内置：SEO、社交分享卡片、转化落地页（真实评价/FAQ/多处 CTA）、一键分享。

### 让它"快速吸引巨大注意力"的动作清单
1. **接入统计像素**（看谁来了、谁转化）：
   - 在 `wrangler.toml` 填 `META_PIXEL_ID`（Meta 广告像素），重新部署。
2. **投流**（最快起量）：
   - Meta Ads / TikTok Ads：直接用**万卡自己生成的广告图+文案**投（吃自己的狗粮，超省）。
   - 目标人群：跨境卖家、中小电商、独立站运营。
3. **裂变**（免费流量）：
   - 站内"🔗 分享"按钮 = 邀请链接，双方得额度（拉新成本≈0）。
4. **内容营销**：
   - 用万卡批量生成多语言短视频脚本，发 TikTok/小红书/YouTube Shorts，钩子指向独立站。
5. **转化**：
   - 落地页已有"免费开始→生成第一套→看到价值→升级付费"的完整漏斗。

---

## ✅ 上线检查清单（照着打勾）

- [ ] 跑 `bash deploy.sh`，拿到永久网址，打开能用
- [ ] （建议）绑定自有域名；要上微信则先办 ICP 备案
- [ ] iOS：注册开发者 → `eas build` → `eas submit` → 填隐私政策 → 提审
- [ ] 安卓：注册 → `eas build` → **今天就开 12 人 ×14 天封闭测试**
- [ ] 微信：注册（建议企业主体）→ 配域名 → 设 WX_APPID/SECRET → （AI 类目办算法备案）→ 提审
- [ ] AppLovin：注册过审 → 填 Key → 配 S2S 回调 → 装 SDK 重构建
- [ ] 独立站：填 Meta Pixel → 开投流 + 分享裂变 + 内容营销

---

## 🆘 常见问题

**Q：网站又打不开了？**
A：如果打开的是 `*.sandbox.*` 网址，那是临时预览，会失效。请用 `bash deploy.sh` 部署后的永久网址。

**Q：我没有 Mac 能上 iOS 吗？**
A：能。`eas build` 在 Expo 云端打包，全程不需要 Mac。

**Q：Google Play 能不能不等 14 天？**
A：不能。这是 Google 对个人号的强制规定。**唯一"加速"办法**是尽早（今天）开始测试，或改用**企业开发者账号**（部分企业号不受此限，但注册更复杂）。

**Q：微信个人号能做 AI 小程序吗？**
A：类目受限、AI 功能常需算法备案，**强烈建议企业主体**。个人号可先上非 AI 功能版本。

**Q：一分钱不想先花能开张吗？**
A：能。独立站（Cloudflare 免费）+ 演示模式广告，先跑起来验证需求；App 商店的账号费（Apple $99/Google $25）等你确认要上再花。
