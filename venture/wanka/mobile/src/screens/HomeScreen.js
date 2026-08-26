import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { C } from '../theme';
import { Btn, Card, H1, H2, Muted } from '../ui';
import { useAuth } from '../auth';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(91,140,255,.12)', borderColor: 'rgba(91,140,255,.32)', borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14 }}>
        <Text style={{ color: C.brand, fontSize: 13, fontWeight: '600' }}>🚀 免费开始 · 30 秒出第一套素材</Text>
      </View>
      <H1>3 分钟，把一个产品{'\n'}变成一整套会卖货的内容</H1>
      <Muted style={{ fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        上传产品 → AI 生成本地化的图片脚本、短视频脚本、广告文案与商品描述。好作品变模板，越用越强。
      </Muted>
      <Btn title={user ? '进入创作台' : '免费开始创作'} onPress={() => navigation.navigate('Studio')} />
      <Btn title="逛模板网络" ghost style={{ marginTop: 10 }} onPress={() => navigation.navigate('Templates')} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 }}>
        {[['9 种语言', '一键本地化'], ['4 类素材', '成套产出'], ['越用越强', '模板网络']].map(([n, l]) => (
          <View key={l} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: C.ink, fontSize: 18, fontWeight: '800' }}>{n}</Text>
            <Muted style={{ fontSize: 12, marginTop: 2 }}>{l}</Muted>
          </View>
        ))}
      </View>

      <Card><H2>🎯 结果导向</H2><Muted>不是"好看"，是"卖得动"——每个模板都带真实使用与成交数据。</Muted></Card>
      <Card><H2>🌐 全球本地化</H2><Muted>中/英/日/韩/西/葡/阿/印/法，一次生成多市场投放。</Muted></Card>
      <Card><H2>🔁 网络越用越强</H2><Muted>好作品变模板被复用，创作者靠作品赚钱，平台越用越好用。</Muted></Card>
    </ScrollView>
  );
}
