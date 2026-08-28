// screens/ReportScreen.js — locked preview -> unlock -> full report + feedback + share.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Screen from '../components/Screen';
import { ScoreDial, DimBars } from '../components/ScoreDial';
import { Button, Card, H2, P, Chip, Divider, Badge } from '../components/ui';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import * as api from '../lib/api';
import { API_BASE } from '../lib/api';
import { colors, spacing } from '../theme';

function Section({ title, items, icon }) {
  if (!items || !items.length) return null;
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.secTitle}>
        {icon} {title}
      </Text>
      {items.map((it, i) => (
        <View key={i} style={styles.bullet}>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.bulletText}>{typeof it === 'string' ? it : it.text}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ReportScreen({ route, navigation }) {
  const { reportId, relationshipId } = route.params || {};
  const { t } = useI18n();
  const { refresh } = useAuth();
  const [state, setState] = useState({ loading: true });
  const [unlocking, setUnlocking] = useState(false);
  const [fb, setFb] = useState(null);

  const load = useCallback(async () => {
    setState({ loading: true });
    try {
      const r = await api.getReport(reportId);
      setState({ loading: false, ...r });
    } catch (e) {
      setState({ loading: false, error: e?.data?.message || e.message });
    }
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  async function unlock() {
    setUnlocking(true);
    try {
      const r = await api.unlockReport(reportId);
      setState({ loading: false, locked: false, report: r.report, report_id: reportId });
      refresh();
    } catch (e) {
      if (e.status === 402 || e?.data?.upgrade) {
        navigation.navigate('Paywall', { reportId });
      } else {
        Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
      }
    } finally {
      setUnlocking(false);
    }
  }

  async function share() {
    try {
      const r = await api.shareReport(reportId);
      const url = `${API_BASE}${r.url}`;
      await Clipboard.setStringAsync(url);
      Alert.alert(t('card_copied'), url);
    } catch (e) {
      Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
    }
  }

  async function sendFb(accuracy) {
    setFb(accuracy);
    try {
      await api.sendFeedback({ relationship_id: relationshipId, report_id: reportId, accuracy });
      Alert.alert(t('fb_thanks'));
    } catch {
      /* silent */
    }
  }

  if (state.loading) {
    return (
      <Screen onBack={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.loadTxt}>{t('rep_loading')}</Text>
        </View>
      </Screen>
    );
  }

  if (state.error) {
    return (
      <Screen onBack={() => navigation.goBack()}>
        <Card style={{ marginTop: spacing.lg }}>
          <P>{state.error}</P>
          <Button title={t('rep_back')} variant="outline" onPress={load} style={{ marginTop: 12 }} />
        </Card>
      </Screen>
    );
  }

  // Locked view
  if (state.locked) {
    const pv = state.preview || {};
    return (
      <Screen onBack={() => navigation.goBack()}>
        <Card style={{ marginTop: spacing.lg }}>
          <ScoreDial score={pv.overall} keyword={pv.keyword} />
          <Text style={styles.headline}>{pv.headline}</Text>
          <DimBars dims={pv.dims} />
          <Divider style={{ marginVertical: spacing.md }} />
          <Text style={styles.hook}>{pv.hook}</Text>

          <View style={styles.lockBox}>
            <Text style={styles.lockTitle}>🔒 {t('unlock_h')}</Text>
            <Text style={styles.lockHint}>{t('preview_unlock_hint')}</Text>
            <Button
              title={t('unlock_btn_free')}
              size="lg"
              loading={unlocking}
              onPress={unlock}
              style={{ marginTop: 12 }}
            />
            <Button
              title={t('unlock_btn_pay')}
              variant="outline"
              onPress={() => navigation.navigate('Paywall', { reportId })}
              style={{ marginTop: 10 }}
            />
          </View>
        </Card>
      </Screen>
    );
  }

  // Full report
  const rep = state.report || {};
  return (
    <Screen onBack={() => navigation.goBack()}>
      <Card style={{ marginTop: spacing.lg }}>
        <Badge text={t('rc_open')} tone="success" />
        <ScoreDial score={rep.overall} keyword={rep.keyword} />
        <Text style={styles.headline}>{rep.headline}</Text>
        <DimBars dims={rep.dims} />

        <Section title={t('rep_strengths')} items={rep.strengths} icon="✨" />
        <Section title={t('rep_frictions')} items={rep.frictions} icon="⚡" />

        {rep.dynamic ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.secTitle}>🔄 {t('rep_dynamic')}</Text>
            <Text style={styles.body}>{rep.dynamic}</Text>
          </View>
        ) : null}

        <Section title={t('rep_advice')} items={rep.advice} icon="🧭" />

        {rep.timing && rep.timing.length ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.secTitle}>📅 {t('rep_timing')}</Text>
            {rep.timing.map((tm, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.bulletText}>{typeof tm === 'string' ? tm : tm.text || JSON.stringify(tm)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Divider style={{ marginVertical: spacing.lg }} />
        <Button title={t('rep_share')} variant="dark" onPress={share} />

        <Text style={styles.fbQ}>{t('rep_feedback_q')}</Text>
        <View style={styles.fbRow}>
          <Chip label={t('fb_hit')} active={fb === 'accurate'} onPress={() => sendFb('accurate')} />
          <Chip label={t('fb_part')} active={fb === 'partly'} onPress={() => sendFb('partly')} />
          <Chip label={t('fb_miss')} active={fb === 'inaccurate'} onPress={() => sendFb('inaccurate')} />
        </View>

        <Text style={styles.disc}>{rep.disclaimer}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 12 },
  loadTxt: { color: colors.text3, fontSize: 14 },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  hook: { fontSize: 15, lineHeight: 23, color: colors.text },
  secTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22, color: colors.text2 },
  bullet: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { color: colors.gold, fontSize: 15, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 22, color: colors.text2 },
  lockBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  lockTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  lockHint: { fontSize: 13, color: colors.text2, marginTop: 6, lineHeight: 20 },
  fbQ: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  fbRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' },
  disc: { fontSize: 11, lineHeight: 17, color: colors.text3, marginTop: spacing.lg },
});
