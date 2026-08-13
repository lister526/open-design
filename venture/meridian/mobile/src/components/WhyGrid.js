// components/WhyGrid.js — "why us" differentiation section (matches web whySection).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../i18n';
import { Card, H2, Eyebrow, P } from './ui';
import { colors, radius, spacing } from '../theme';

const CARDS = [
  { ic: '🎯', t: 'why1_t', d: 'why1_d' },
  { ic: '🧭', t: 'why2_t', d: 'why2_d' },
  { ic: '🕊️', t: 'why3_t', d: 'why3_d' },
  { ic: '📈', t: 'why4_t', d: 'why4_d' },
];

export default function WhyGrid() {
  const { t } = useI18n();
  return (
    <View style={styles.section}>
      <Eyebrow style={{ textAlign: 'center' }}>✦</Eyebrow>
      <H2 style={{ textAlign: 'center', marginTop: 6 }}>{t('why_h')}</H2>
      <P muted style={{ textAlign: 'center', marginTop: 8, marginBottom: spacing.lg }}>
        {t('why_sub')}
      </P>
      <View style={styles.grid}>
        {CARDS.map((c) => (
          <Card key={c.t} style={styles.card}>
            <View style={styles.icWrap}>
              <Text style={styles.ic}>{c.ic}</Text>
            </View>
            <Text style={styles.title}>{t(c.t)}</Text>
            <Text style={styles.desc}>{t(c.d)}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: spacing.xl },
  grid: { gap: spacing.md },
  card: { padding: spacing.lg },
  icWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ic: { fontSize: 22 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6 },
  desc: { fontSize: 14, lineHeight: 21, color: colors.text2 },
});
