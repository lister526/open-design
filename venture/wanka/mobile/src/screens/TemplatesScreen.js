import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Alert, RefreshControl } from 'react-native';
import { C } from '../theme';
import { Btn, Card, H1, Muted, Pill } from '../ui';
import { useAuth } from '../auth';
import * as api from '../lib/api';

const KIND_LABEL = { ad_copy: '广告文案', video_script: '短视频脚本', image_brief: '主图/图片指令', listing: '商品描述' };

export default function TemplatesScreen({ navigation }) {
  const { user } = useAuth();
  const [kind, setKind] = useState('');
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (k) => {
    try { const r = await api.listTemplates(k || undefined); setList(r.templates || []); } catch {}
  }, []);
  useEffect(() => { load(kind); }, [kind, load]);

  const onRefresh = async () => { setRefreshing(true); await load(kind); setRefreshing(false); };

  const use = async (tp) => {
    if (!user) return navigation.navigate('Account');
    Alert.prompt ? Alert.prompt('输入你的产品名称', '', async (product) => {
      if (!product) return;
      try { await api.useTemplate(tp.id, { product, title: product, lang: 'zh' }); Alert.alert('已生成 ✅', '前往创作台查看'); navigation.navigate('Studio'); }
      catch (e) { Alert.alert('失败', e.message); }
    }) : Alert.alert('提示', '请在创作台直接生成');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.ink} />}>
      <H1>模板网络</H1>
      <Muted>别人做出的爆款配方，一键套用到你的产品上。使用与成交越多，排名越靠前。</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {['', 'ad_copy', 'video_script', 'image_brief', 'listing'].map((k) => (
          <Pill key={k || 'all'} label={k ? KIND_LABEL[k] : '全部'} on={kind === k} onPress={() => setKind(k)} />
        ))}
      </View>
      {list.map((tp) => (
        <Card key={tp.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: C.ink, fontWeight: '700', flex: 1 }}>{tp.title}</Text>
            <Text style={{ color: C.mut, fontSize: 12 }}>{KIND_LABEL[tp.kind] || tp.kind}</Text>
          </View>
          {tp.preview ? <Muted style={{ marginTop: 6 }}>{tp.preview}</Muted> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Muted>🔥 {tp.uses} · 🏆 {tp.wins}</Muted>
            <Btn title="用它生成" onPress={() => use(tp)} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />
          </View>
        </Card>
      ))}
      {list.length === 0 ? <Muted style={{ marginTop: 20 }}>暂无模板</Muted> : null}
    </ScrollView>
  );
}
