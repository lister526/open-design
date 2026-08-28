// screens/HomeScreen.js — landing: hero + trust + why + how + stories + pricing + faq + CTA.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import TrustBar from '../components/TrustBar';
import WhyGrid from '../components/WhyGrid';
import { Button, Card, H1, H2, P, Eyebrow, Badge, Divider } from '../components/ui';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { colors, spacing, radius, shadow } from '../theme';

function Hero({ onStart, t }) {
  return (
    <View style={styles.hero}>
      <Eyebrow>{t('hero_eyebrow')}</Eyebrow>
      <H1 style={{ marginTop: 12 }}>{t('hero_title')}</H1>
      <P style={{ marginTop: 14, fontSize: 17 }}>{t('hero_sub')}</P>
      <Button
        title={t('hero_cta')}
        size="lg"
        onPress={onStart}
        style={{ marginTop: spacing.lg }}
      />
      <Text style={styles.heroNote}>{t('hero_note')}</Text>
    </View>
  );
}

function How({ t }) {
  const feats = [
    { ic: '🀄', tt: 'feat1_t', dd: 'feat1_d' },
    { ic: '💞', tt: 'feat2_t', dd: 'feat2_d' },
    { ic: '🧭', tt: 'feat3_t', dd: 'feat3_d' },
  ];
  return (
    <View style={styles.section}>
      <H2 style={{ textAlign: 'center' }}>{t('how_h')}</H2>
      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {feats.map((f) => (
          <Card key={f.tt} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 26 }}>{f.ic}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featT}>{t(f.tt)}</Text>
              <Text style={styles.featD}>{t(f.dd)}</Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

function Stories({ t }) {
  const items = [
    { q: 'story1', m: 'story1m' },
    { q: 'story2', m: 'story2m' },
    { q: 'story3', m: 'story3m' },
  ];
  return (
    <View style={styles.section}>
      <H2 style={{ textAlign: 'center' }}>{t('stories_h')}</H2>
      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {items.map((s) => (
          <Card key={s.q} tint>
            <Text style={styles.storyQ}>“{t(s.q)}”</Text>
            <Text style={styles.storyM}>— {t(s.m)}</Text>
          </Card>
        ))}
      </View>
      <Text style={styles.storiesNote}>{t('stories_note')}</Text>
    </View>
  );
}

function Pricing({ t, px, onStart }) {
  const plans = [
    { n: 'plan_free_n', d: 'plan_free_d', price: px.free, cta: 'plan_cta_free', variant: 'outline' },
    { n: 'plan_lite_n', d: 'plan_lite_d', price: px.lite, cta: 'plan_cta', pop: true, variant: 'primary' },
    { n: 'plan_month_n', d: 'plan_month_d', price: px.month, cta: 'plan_cta', variant: 'dark' },
    { n: 'plan_marry_n', d: 'plan_marry_d', price: px.marry, cta: 'plan_cta', variant: 'outline' },
  ];
  return (
    <View style={styles.section}>
      <H2 style={{ textAlign: 'center' }}>{t('pricing_h')}</H2>
      <P muted style={{ textAlign: 'center', marginTop: 8 }}>
        {t('pricing_sub')}
      </P>
      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {plans.map((pl) => (
          <Card
            key={pl.n}
            style={[pl.pop && { borderColor: colors.gold, borderWidth: 2 }, pl.pop && shadow.gold]}
          >
            {pl.pop ? <Badge text={t('plan_pop')} /> : null}
            <View style={styles.planHead}>
              <Text style={styles.planName}>{t(pl.n)}</Text>
              <Text style={styles.planPrice}>{pl.price}</Text>
            </View>
            <Text style={styles.planDesc}>{t(pl.d)}</Text>
            <Button
              title={t(pl.cta)}
              variant={pl.variant}
              onPress={onStart}
              style={{ marginTop: 12 }}
            />
          </Card>
        ))}
      </View>
      <Text style={styles.guarantee}>✓ {t('plan_guarantee')}</Text>
    </View>
  );
}

function Faq({ t }) {
  const qs = [
    ['faq_q1', 'faq_a1'],
    ['faq_q2', 'faq_a2'],
    ['faq_q3', 'faq_a3'],
    ['faq_q4', 'faq_a4'],
    ['faq_q5', 'faq_a5'],
  ];
  return (
    <View style={styles.section}>
      <H2 style={{ textAlign: 'center' }}>{t('faq_h')}</H2>
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {qs.map(([q, a]) => (
          <View key={q} style={styles.faqItem}>
            <Text style={styles.faqQ}>{t(q)}</Text>
            <Text style={styles.faqA}>{t(a)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { t, px } = useI18n();
  const { isLoggedIn } = useAuth();

  const start = () => navigation.navigate('Funnel');

  return (
    <Screen
      right={
        <Button
          title={isLoggedIn ? t('nav_mine') : t('nav_login')}
          variant="ghost"
          size="sm"
          onPress={() => navigation.navigate(isLoggedIn ? 'Account' : 'Auth')}
        />
      }
    >
      <Hero onStart={start} t={t} />
      <TrustBar />
      <WhyGrid />
      <How t={t} />
      <Stories t={t} />
      <Pricing t={t} px={px} onStart={start} />
      <Faq t={t} />

      <View style={styles.ctaBand}>
        <H2 inverse style={{ textAlign: 'center' }}>
          {t('cta_h')}
        </H2>
        <P inverse style={{ textAlign: 'center', marginTop: 10 }}>
          {t('cta_sub')}
        </P>
        <Button title={t('cta_btn')} size="lg" onPress={start} style={{ marginTop: spacing.lg }} />
      </View>

      <Divider style={{ marginTop: spacing.xl }} />
      <Text style={styles.footTag}>{t('foot_tag')}</Text>
      <Text style={styles.footDisc}>{t('foot_disc')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  heroNote: { marginTop: 12, fontSize: 13, color: colors.text3, textAlign: 'center' },
  section: { paddingVertical: spacing.xl },
  featT: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  featD: { fontSize: 14, lineHeight: 21, color: colors.text2 },
  storyQ: { fontSize: 15, lineHeight: 23, color: colors.text, fontWeight: '600' },
  storyM: { fontSize: 13, color: colors.text3, marginTop: 8 },
  storiesNote: { fontSize: 12, color: colors.text3, textAlign: 'center', marginTop: 14 },
  planHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  planName: { fontSize: 17, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 22, fontWeight: '900', color: colors.gold, writingDirection: 'ltr' },
  planDesc: { fontSize: 14, lineHeight: 21, color: colors.text2, marginTop: 6 },
  guarantee: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
  faqItem: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  faqQ: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  faqA: { fontSize: 14, lineHeight: 21, color: colors.text2 },
  ctaBand: {
    marginTop: spacing.xl,
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  footTag: { textAlign: 'center', marginTop: spacing.lg, fontSize: 14, color: colors.text2, fontWeight: '700' },
  footDisc: { textAlign: 'center', marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.text3 },
});
