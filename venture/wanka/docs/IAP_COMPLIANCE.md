# 应用内购买 (IAP) 合规说明 — iOS / Android

> 一句话：**在 App 里卖"额度/会员"这类数字商品，必须走苹果 StoreKit / 谷歌 Play Billing 的应用内购买，不能用自己的网页支付或微信/支付宝跳转。** 否则 100% 被拒。

## 为什么

- **Apple App Store 3.1.1**：App 内解锁的数字内容/功能（这里的"创作额度"和"Pro 会员"）只能用 Apple IAP，Apple 抽成 15%–30%。用外部支付会被拒/下架。
- **Google Play Billing**：同理，数字商品必须用 Play 结算。

实体商品、线下服务可以用第三方支付；**我们的额度是纯数字商品，所以必须 IAP。**

## 现在代码是什么状态

- `mobile/src/screens/AccountScreen.js` 里的"升级套餐"按钮目前调用后端 `/api/billing/checkout`（**开发预览用的假结算**），只用于本地跑通流程。
- **上架前必须替换成原生 IAP**（下面步骤）。网页站（独立站）不受此限制，可继续用微信/支付宝/Stripe。

## 上架前要做的（一次性）

### 1. 装 IAP 库
```bash
cd mobile
npx expo install react-native-iap
```

### 2. 在 App Store Connect / Play Console 建"消耗型/订阅"商品
- 苹果：App Store Connect → 你的 App → App 内购买项目 → 新建
  - 额度包 = **消耗型 (Consumable)**，例如 `credits_300`
  - Pro/Team 月费 = **自动续订订阅 (Auto-Renewable)**，例如 `pro_monthly`
- 谷歌：Play Console → 创收 → 应用内商品 / 订阅，建同名 product id

### 3. 客户端购买 → 后端发额度
把 `AccountScreen.js` 的 `buy(plan)` 改成：
```js
import * as IAP from 'react-native-iap';
// 1) 发起原生购买
const purchase = await IAP.requestPurchase({ sku: PLAN_SKU[plan] });
// 2) 把收据发给后端校验，校验通过后后端加额度
await api.verifyPurchase({
  platform: Platform.OS,            // 'ios' | 'android'
  receipt: purchase.transactionReceipt,
  productId: purchase.productId,
});
// 3) 刷新用户额度
await refresh();
await IAP.finishTransaction({ purchase });
```

### 4. 后端加一个收据校验路由（生产）
新增 `POST /api/billing/verify`：
- iOS：把收据 POST 到 Apple `verifyReceipt`（或用 App Store Server API）
- Android：用 Google Play Developer API `purchases.products/subscriptions.get`
- 校验通过后：`UPDATE users SET plan=?, credits=credits+? ...`
- **务必幂等**（按交易号去重，防止重复发额度）。

> 现有的 `/api/billing/checkout` 保留给**网页独立站**用（网页可用 Stripe/微信/支付宝）。
> App 端只走 `/api/billing/verify`。

## 常见拒审点（避雷）

- ❌ App 内出现"去网页购买""微信支付"字样或链接 → 苹果直接拒。
- ✅ 订阅必须在 App 内展示：价格、周期、续订说明、以及《隐私政策》《服务条款》链接。
- ✅ 必须能在 App 内**恢复购买 (Restore Purchases)** —— 加一个按钮调用 `IAP.getAvailablePurchases()`。
- ✅ "看广告换额度"是允许的（不属于购买），已实现。
