import React, { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { C } from '../theme';
import { Btn, Card, Field, H1, H2, Muted, Pill } from '../ui';
import { useAuth } from '../auth';
import * as api from '../lib/api';

const KIND_LABEL = { ad_copy: '广告文案', video_script: '短视频脚本', image_brief: '主图/图片指令', listing: '商品描述' };

export default function StudioScreen({ navigation }) {
  const { user, setUser, config } = useAuth();
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [selling, setSelling] = useState('');
  const [langs, setLangs] = useState(['zh', 'en']);
  const [kinds, setKinds] = useState(['ad_copy', 'video_script', 'image_brief', 'listing']);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const langsAvail = (config?.langs || ['zh', 'en', 'ja', 'ko', 'es', 'pt', 'ar', 'hi', 'fr']).slice(0, 9);
  const kindsAvail = config?.kinds || ['ad_copy', 'video_script', 'image_brief', 'listing'];
  const toggle = (arr, v, set) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' }}>
        <Card><H2>请先登录</H2><Muted>登录后即可开始创作营销素材。</Muted>
          <Btn title="去登录 / 注册" style={{ marginTop: 14 }} onPress={() => navigation.navigate('Account')} />
        </Card>
      </View>
    );
  }

  const doGenerate = async () => {
    if (!product.trim()) return Alert.alert('提示', '请填写产品名称');
    if (!kinds.length || !langs.length) return Alert.alert('提示', '至少选一种语言和一类素材');
    setLoading(true);
    try {
      const r = await api.generate({ product: product.trim(), title: product.trim(), audience: audience.trim(), selling_pts: selling.trim(), kinds, langs });
      setAssets(r.assets || []);
      if (typeof r.credits === 'number') setUser({ ...user, credits: r.credits });
    } catch (e) {
      if (e.status === 402) { Alert.alert('额度不足', '请升级套餐或观看激励广告获取额度。'); navigation.navigate('Account'); }
      else Alert.alert('生成失败', e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <H1>创作台</H1>
      <Muted>填一次产品信息，成套生成多语言营销素材。 剩余额度 ⚡ {user.credits}</Muted>

      <Card>
        <Field label="产品名称" value={product} onChangeText={setProduct} placeholder="例如：便携榨汁杯" autoCapitalize="sentences" />
        <Field label="目标人群 / 市场" value={audience} onChangeText={setAudience} placeholder="例如：欧美健身年轻女性" autoCapitalize="sentences" />
        <Field label="卖点（每行一个）" value={selling} onChangeText={setSelling} placeholder={'便携\n30 秒出汁\n可水洗\nUSB 充电'} multiline autoCapitalize="sentences" />

        <Text style={{ color: C.mut, fontSize: 13, marginTop: 12, marginBottom: 6 }}>目标语言</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {langsAvail.map((l) => <Pill key={l} label={l.toUpperCase()} on={langs.includes(l)} onPress={() => toggle(langs, l, setLangs)} />)}
        </View>

        <Text style={{ color: C.mut, fontSize: 13, marginTop: 6, marginBottom: 6 }}>要生成的素材</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {kindsAvail.map((k) => <Pill key={k} label={KIND_LABEL[k] || k} on={kinds.includes(k)} onPress={() => toggle(kinds, k, setKinds)} />)}
        </View>

        <Muted style={{ marginTop: 10 }}>本次将消耗 {langs.length * kinds.length} 点额度（每条素材 1 点）</Muted>
        <Btn title="生成成套素材" loading={loading} style={{ marginTop: 12 }} onPress={doGenerate} />
      </Card>

      {assets.map((a, i) => <AssetCard key={i} a={a} />)}
    </ScrollView>
  );
}

function AssetCard({ a }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: C.brand, fontWeight: '700' }}>{KIND_LABEL[a.kind] || a.kind} · {String(a.lang || '').toUpperCase()}</Text>
        <Text style={{ color: a._fallback ? C.mut : C.good, fontSize: 12 }}>{a._fallback ? 'mock' : 'AI'}</Text>
      </View>
      {a.kind === 'ad_copy' && (<>
        <Text style={{ color: C.ink, fontWeight: '700', fontSize: 16 }}>{a.headline}</Text>
        <Text style={{ color: C.ink, marginTop: 6 }}>{a.body}</Text>
        <Muted style={{ marginTop: 6 }}>{a.cta}</Muted>
      </>)}
      {a.kind === 'video_script' && (a.beats || []).map((b, i) => (
        <Text key={i} style={{ color: C.ink, marginTop: 4 }}><Text style={{ fontWeight: '700' }}>{b.t} </Text><Muted>{b.label} </Muted>{b.line}</Text>
      ))}
      {a.kind === 'image_brief' && (<>
        <Muted>版式：{a.layout}</Muted>
        <Text style={{ color: C.ink, marginTop: 8, fontFamily: 'monospace' }}>{a.prompt}</Text>
      </>)}
      {a.kind === 'listing' && (<>
        <Text style={{ color: C.ink, fontWeight: '700' }}>{a.title}</Text>
        {(a.bullets || []).map((x, i) => <Text key={i} style={{ color: C.ink, marginTop: 2 }}>• {x}</Text>)}
        <Muted style={{ marginTop: 6 }}>{(a.keywords || []).join(' · ')}</Muted>
      </>)}
    </Card>
  );
}
