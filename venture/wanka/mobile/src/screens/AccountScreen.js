import React, { useState } from 'react';
import { ScrollView, View, Text, Alert, Linking } from 'react-native';
import { C } from '../theme';
import { Btn, Card, Field, H1, H2, Muted, Pill } from '../ui';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { rewardedAd } from '../lib/ads';

export default function AccountScreen() {
  const { user, setUser, login, register, logout, refresh } = useAuth();
  if (!user) return <AuthForm login={login} register={register} />;
  return <LoggedIn user={user} setUser={setUser} logout={logout} refresh={refresh} />;
}

function AuthForm({ login, register }) {
  const [mode, setMode] = useState('register');
  const [role, setRole] = useState('merchant');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pw) return Alert.alert('提示', '请填邮箱和密码');
    setLoading(true);
    try { await (mode === 'register' ? register : login)({ email: email.trim(), password: pw, role, lang: 'zh' }); }
    catch (e) {
      const map = { email_taken: '邮箱已注册', bad_credentials: '邮箱或密码错误' };
      Alert.alert('失败', map[e.message] || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20 }}>
      <H1>{mode === 'register' ? '注册' : '登录'}</H1>
      <Card>
        <View style={{ flexDirection: 'row' }}>
          <Pill label="注册" on={mode === 'register'} onPress={() => setMode('register')} />
          <Pill label="登录" on={mode === 'login'} onPress={() => setMode('login')} />
        </View>
        {mode === 'register' && (
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Pill label="我是商家" on={role === 'merchant'} onPress={() => setRole('merchant')} />
            <Pill label="我是创作者" on={role === 'creator'} onPress={() => setRole('creator')} />
          </View>
        )}
        <Field label="邮箱" value={email} onChangeText={setEmail} placeholder="you@shop.com" keyboardType="email-address" />
        <Field label="密码" value={pw} onChangeText={setPw} placeholder="••••••••" secureTextEntry />
        <Btn title={mode === 'register' ? '注册' : '登录'} loading={loading} style={{ marginTop: 14 }} onPress={submit} />
      </Card>
      <Muted style={{ marginTop: 14, fontSize: 12 }}>
        继续即表示同意《服务条款》与《隐私政策》。
      </Muted>
    </ScrollView>
  );
}

function LoggedIn({ user, setUser, logout, refresh }) {
  const [busy, setBusy] = useState(false);

  const buy = async (plan) => {
    // NOTE: On iOS/Android, digital credits MUST be sold via native IAP (StoreKit / Play Billing)
    // per App Store 3.1.1 & Play policy. Web checkout is the dev stub. See docs/IAP_COMPLIANCE.md.
    setBusy(true);
    try { const r = await api.checkout(plan); setUser({ ...user, plan: r.plan, credits: r.credits }); Alert.alert('已升级 ✅', `当前套餐：${r.plan}`); }
    catch (e) { Alert.alert('失败', e.message); } finally { setBusy(false); }
  };

  const watchAd = async () => {
    setBusy(true);
    try {
      const reward = await rewardedAd(); // resolves when the SDK grants the reward
      // AppLovin S2S callback is authoritative; client claim is best-effort/optimistic.
      const r = await api.claimRewardedCredits({ amount: reward?.amount || 5, network: 'applovin' }).catch(() => null);
      if (r?.credits != null) setUser({ ...user, credits: r.credits });
      else await refresh();
      Alert.alert('已获得额度 🎁', '感谢观看，额度已到账。');
    } catch (e) { Alert.alert('广告未完成', String(e?.message || e)); } finally { setBusy(false); }
  };

  const doExport = async () => {
    setBusy(true);
    try { const data = await api.exportData(); Alert.alert('数据导出成功', `账户 + ${data?.projects?.length || 0} 个项目 + ${data?.assets?.length || 0} 条素材。可在设置中申请邮件副本。`); }
    catch (e) { Alert.alert('失败', e.message); } finally { setBusy(false); }
  };

  const doDelete = () => {
    Alert.alert('删除账户', '此操作将永久删除你的账户与全部数据，且不可恢复。确定继续？', [
      { text: '取消', style: 'cancel' },
      { text: '永久删除', style: 'destructive', onPress: async () => {
          setBusy(true);
          try { await api.deleteAccount(); await logout(); Alert.alert('已删除', '你的账户与数据已永久删除。'); }
          catch (e) { Alert.alert('失败', e.message); } finally { setBusy(false); }
        } },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <H1>我的账户</H1>
      <Card>
        <Text style={{ color: C.ink, fontWeight: '700' }}>{user.email}</Text>
        <Muted style={{ marginTop: 4 }}>套餐：{user.plan || 'free'} · 剩余额度 ⚡ {user.credits}</Muted>
        <Btn title="🎁 看广告免费领额度" ghost style={{ marginTop: 12 }} loading={busy} onPress={watchAd} />
      </Card>

      <H2>{'\n'}升级套餐</H2>
      <Muted style={{ fontSize: 12 }}>移动端将通过 App 内购买（IAP）结算。以下为开发预览按钮。</Muted>
      {[['starter', '¥39/月', 300], ['pro', '¥99/月', 1500], ['team', '¥299/月', 5000]].map(([id, price, credits]) => (
        <Card key={id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View><Text style={{ color: C.ink, fontWeight: '700', textTransform: 'capitalize' }}>{id}</Text><Muted>{price} · ⚡ {credits}/月</Muted></View>
            <Btn title="选择" loading={busy} onPress={() => buy(id)} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
          </View>
        </Card>
      ))}

      <H2>{'\n'}隐私与数据</H2>
      <Btn title="导出我的数据" ghost style={{ marginTop: 8 }} loading={busy} onPress={doExport} />
      <Btn title="隐私政策" ghost style={{ marginTop: 8 }} onPress={() => Linking.openURL('https://wanka.app/privacy')} />
      <Btn title="退出登录" ghost style={{ marginTop: 8 }} onPress={logout} />

      <View style={{ height: 1, backgroundColor: C.line, marginVertical: 20 }} />
      <Btn title="永久删除账户" style={{ backgroundColor: C.bad }} loading={busy} onPress={doDelete} />
      <Muted style={{ marginTop: 8, fontSize: 12 }}>依据 App Store 5.1.1(v)，支持在应用内直接删除账户。</Muted>
    </ScrollView>
  );
}
