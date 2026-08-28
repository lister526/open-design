// components/TrustBar.js — 4 trust promises (payment-attractive, matches web trustBar).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../i18n';
import { colors, radius, spacing } from '../theme';

const ITEMS = [
  { ic: '📜', key: 'trust_1' },
  { ic: '🔍', key: 'trust_2' },
  { ic: '🚫', key: 'trust_3' },
  { ic: '🔒', key: 'trust_4' },
];

export default function TrustBar() {
  const { t } = useI18n();
  return (
    <View style={styles.wrap}>
      {ITEMS.map((it) => (
        <View key={it.key} style={styles.item}>
          <Text style={styles.ic}>{it.ic}</Text>
          <Text style={styles.txt}>{t(it.key)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
    borderRadius: radius.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  ic: { fontSize: 16 },
  txt: { fontSize: 13, color: colors.text2, fontWeight: '600' },
});
