// components/ScoreDial.js — big compatibility score + keyword, plus dimension bars.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../i18n';
import { colors, radius, scoreColor } from '../theme';

// Map backend Chinese dim keys -> i18n label keys.
const DIM_MAP = [
  { cn: '吸引力', key: 'dim_attraction' },
  { cn: '契合度', key: 'dim_fit' },
  { cn: '滋养度', key: 'dim_nourish' },
  { cn: '共鸣度', key: 'dim_resonance' },
  { cn: '长久度', key: 'dim_longevity' },
  { cn: '稳定度', key: 'dim_stability' },
];

export function ScoreDial({ score = 0, keyword = '' }) {
  const col = scoreColor(score);
  return (
    <View style={styles.dialWrap}>
      <View style={[styles.ring, { borderColor: col }]}>
        {/* numbers/scores always LTR */}
        <Text style={[styles.score, { color: col, writingDirection: 'ltr' }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
      {keyword ? <Text style={styles.keyword}>{keyword}</Text> : null}
    </View>
  );
}

export function DimBars({ dims }) {
  const { t } = useI18n();
  if (!dims) return null;
  return (
    <View style={styles.dims}>
      {DIM_MAP.map((d) => {
        const v = Number(dims[d.cn] ?? dims[d.key] ?? 0);
        return (
          <View key={d.cn} style={styles.dimRow}>
            <Text style={styles.dimLabel}>{t(d.key)}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.max(4, Math.min(100, v))}%`, backgroundColor: scoreColor(v) },
                ]}
              />
            </View>
            <Text style={[styles.dimVal, { writingDirection: 'ltr' }]}>{v}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dialWrap: { alignItems: 'center', marginVertical: 12 },
  ring: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  score: { fontSize: 46, fontWeight: '900', letterSpacing: -1 },
  scoreMax: { fontSize: 12, color: colors.text3, marginTop: -4 },
  keyword: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  dims: { marginTop: 8, gap: 10 },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dimLabel: { width: 64, fontSize: 13, color: colors.text2, fontWeight: '600' },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4 },
  dimVal: { width: 28, textAlign: 'right', fontSize: 13, color: colors.text3, fontWeight: '700' },
});

export default ScoreDial;
