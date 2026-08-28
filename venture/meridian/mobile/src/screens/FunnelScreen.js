// screens/FunnelScreen.js — pick relationship type, fill both people, get free preview.
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Screen from '../components/Screen';
import PersonForm, { emptyPerson } from '../components/PersonForm';
import { ScoreDial, DimBars } from '../components/ScoreDial';
import { Button, Card, H2, P, Eyebrow, Chip, Divider } from '../components/ui';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import * as api from '../lib/api';
import { colors, spacing } from '../theme';

const REL_TYPES = [
  { code: 'romance', key: 'rel_romance' },
  { code: 'crush', key: 'rel_crush' },
  { code: 'reunion', key: 'rel_reunion' },
  { code: 'marriage', key: 'rel_marriage' },
  { code: 'friendship', key: 'rel_friendship' },
];

export default function FunnelScreen({ navigation }) {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const [relType, setRelType] = useState('romance');
  const [a, setA] = useState(emptyPerson('female'));
  const [b, setB] = useState(emptyPerson('male'));
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  async function run() {
    if (!a.date || !b.date) {
      Alert.alert(t('err_need_dates'));
      return;
    }
    setLoading(true);
    setPreview(null);
    try {
      const r = await api.syncPreview({ a, b, rel_type: relType });
      setPreview(r.preview);
    } catch (e) {
      Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveAndOpen() {
    if (!isLoggedIn) {
      navigation.navigate('Auth', { next: 'Funnel' });
      return;
    }
    setSaving(true);
    try {
      const r = await api.createRelationship({ a, b, rel_type: relType });
      navigation.navigate('Report', { reportId: r.report_id, relationshipId: r.relationship_id });
    } catch (e) {
      Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen onBack={() => navigation.goBack()}>
      <Eyebrow style={{ marginTop: spacing.md }}>✦</Eyebrow>
      <H2 style={{ marginTop: 6 }}>{t('try_h')}</H2>
      <P muted style={{ marginTop: 8 }}>
        {t('try_sub')}
      </P>

      <View style={styles.relRow}>
        {REL_TYPES.map((r) => (
          <Chip
            key={r.code}
            label={t(r.key)}
            active={relType === r.code}
            onPress={() => setRelType(r.code)}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>

      <View style={{ marginTop: spacing.md }}>
        <PersonForm title={t('label_you')} value={a} onChange={setA} />
        <PersonForm title={t('label_ta')} value={b} onChange={setB} />
      </View>

      <Button
        title={loading ? t('try_loading') : t('try_btn')}
        size="lg"
        loading={loading}
        onPress={run}
      />

      {preview ? (
        <Card style={{ marginTop: spacing.lg }}>
          <ScoreDial score={preview.overall} keyword={preview.keyword} />
          <Text style={styles.headline}>{preview.headline}</Text>
          <DimBars dims={preview.dims} />
          <Divider style={{ marginVertical: spacing.md }} />
          <Text style={styles.hookLabel}>✦ {t('preview_score')}</Text>
          <Text style={styles.hook}>{preview.hook}</Text>

          <View style={styles.lockedBox}>
            <Text style={styles.lockedTitle}>🔒 {t('preview_locked')}</Text>
            <Text style={styles.lockedHint}>{t('preview_unlock_hint')}</Text>
            <View style={styles.countRow}>
              <Text style={styles.count}>
                {t('lc_strengths')}: {preview.locked_counts?.strengths ?? 0}
              </Text>
              <Text style={styles.count}>
                {t('lc_frictions')}: {preview.locked_counts?.frictions ?? 0}
              </Text>
              <Text style={styles.count}>
                {t('lc_advice')}: {preview.locked_counts?.advice ?? 0}
              </Text>
              <Text style={styles.count}>
                {t('lc_months')}: {preview.locked_counts?.timing ?? 0}
              </Text>
            </View>
          </View>

          <Button
            title={isLoggedIn ? t('preview_save') : t('preview_login_first')}
            variant="dark"
            size="lg"
            loading={saving}
            onPress={saveAndOpen}
            style={{ marginTop: spacing.md }}
          />
          <Text style={styles.disc}>{preview.disclaimer}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  relRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.lg },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  hookLabel: { fontSize: 13, fontWeight: '800', color: colors.gold, marginBottom: 4 },
  hook: { fontSize: 15, lineHeight: 23, color: colors.text },
  lockedBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  lockedTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  lockedHint: { fontSize: 13, color: colors.text2, marginTop: 6, lineHeight: 20 },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  count: { fontSize: 12, color: colors.text3, fontWeight: '600' },
  disc: { fontSize: 11, lineHeight: 17, color: colors.text3, marginTop: 12 },
});
