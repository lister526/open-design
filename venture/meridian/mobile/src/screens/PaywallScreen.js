// screens/PaywallScreen.js — upgrade options; checkout intent (entitlement granted server-side).
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import Screen from '../components/Screen';
import { Button, Card, H2, P, Badge } from '../components/ui';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import * as api from '../lib/api';
import { colors, spacing, shadow } from '../theme';

// plan codes must match backend PLANS keys.
const PLANS = [
  { code: 'report_lite', n: 'plan_lite_n', d: 'plan_lite_d', priceKey: 'lite' },
  { code: 'sync_monthly', n: 'plan_month_n', d: 'plan_month_d', priceKey: 'month', pop: true },
  { code: 'report_marriage', n: 'plan_marry_n', d: 'plan_marry_d', priceKey: 'marry' },
];

export default function PaywallScreen({ route, navigation }) {
  const { reportId } = route.params || {};
  const { t, px } = useI18n();
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(null);

  async function buy(plan) {
    setBusy(plan);
    try {
      const r = await api.checkout({ plan });
      // Mock/live: backend returns a checkout intent. If it has a URL, open it.
      if (r?.url && /^https?:/i.test(r.url)) {
        await Linking.openURL(r.url);
      }
      Alert.alert(
        t('checkout_pending'),
        r?.note || '',
        [
          {
            text: 'OK',
            onPress: async () => {
              await refresh();
              if (reportId) navigation.navigate('Report', { reportId });
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen onBack={() => navigation.goBack()}>
      <H2 style={{ marginTop: spacing.lg, textAlign: 'center' }}>{t('pricing_h')}</H2>
      <P muted style={{ textAlign: 'center', marginTop: 8 }}>
        {t('pricing_sub')}
      </P>

      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {PLANS.map((pl) => (
          <Card
            key={pl.code}
            style={[pl.pop && { borderColor: colors.gold, borderWidth: 2 }, pl.pop && shadow.gold]}
          >
            {pl.pop ? <Badge text={t('plan_pop')} /> : null}
            <View style={styles.head}>
              <Text style={styles.name}>{t(pl.n)}</Text>
              <Text style={styles.price}>{px[pl.priceKey]}</Text>
            </View>
            <Text style={styles.desc}>{t(pl.d)}</Text>
            <Button
              title={t('plan_cta')}
              variant={pl.pop ? 'primary' : 'dark'}
              loading={busy === pl.code}
              onPress={() => buy(pl.code)}
              style={{ marginTop: 12 }}
            />
          </Card>
        ))}
      </View>

      <Text style={styles.guarantee}>✓ {t('plan_guarantee')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 },
  name: { fontSize: 17, fontWeight: '800', color: colors.text },
  price: { fontSize: 22, fontWeight: '900', color: colors.gold, writingDirection: 'ltr' },
  desc: { fontSize: 14, lineHeight: 21, color: colors.text2, marginTop: 6 },
  guarantee: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
});
