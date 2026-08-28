// screens/AccountScreen.js — profile, credits, saved relationships, export/delete/logout.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { TopBar } from '../components/Screen';
import { Button, Card, H2, P, Badge, Divider } from '../components/ui';
import { ScoreDial } from '../components/ScoreDial';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import * as api from '../lib/api';
import { colors, spacing, radius } from '../theme';

export default function AccountScreen({ navigation }) {
  const { t } = useI18n();
  const { user, logout, refresh } = useAuth();
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      await refresh();
      const r = await api.listRelationships();
      setRels(r.relationships || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  async function doExport() {
    try {
      const r = await api.exportMe();
      await Clipboard.setStringAsync(JSON.stringify(r, null, 2));
      Alert.alert(t('acct_export'), t('card_copied'));
    } catch (e) {
      Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
    }
  }

  function doDelete() {
    Alert.alert(t('acct_delete'), t('acct_confirm1'), [
      { text: '✕', style: 'cancel' },
      {
        text: t('acct_confirm2'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteMe();
            await logout();
            Alert.alert(t('acct_deleted'));
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          } catch (e) {
            Alert.alert(t('common_unavailable'), e?.data?.message || e.message);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <TopBar onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.gold}
          />
        }
      >
        <H2 style={{ marginTop: spacing.md }}>{t('mine_h')}</H2>

        {user ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.metaRow}>
              <Badge text={user.plan === 'member' ? '★ ' + user.plan : user.plan} />
              <Text style={styles.credits}>
                🎟 {user.credits} · {t('unlock_credits')}
              </Text>
            </View>
          </Card>
        ) : null}

        <Button
          title={t('mine_new')}
          size="lg"
          onPress={() => navigation.navigate('Funnel')}
          style={{ marginTop: spacing.md }}
        />

        <Text style={styles.sectionH}>{t('mine_h')}</Text>
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 20 }} />
        ) : rels.length === 0 ? (
          <Card tint style={{ marginTop: spacing.sm, alignItems: 'center' }}>
            <Text style={styles.emptyT}>{t('mine_empty_t')}</Text>
            <Text style={styles.emptyD}>{t('mine_empty_d')}</Text>
            <Button
              title={t('mine_empty_btn')}
              variant="outline"
              onPress={() => navigation.navigate('Funnel')}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : (
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {rels.map((r) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  navigation.navigate('Report', { reportId: r.report_id, relationshipId: r.id })
                }
              >
                <Card style={styles.relCard}>
                  <View style={styles.relScore}>
                    <Text style={styles.relScoreNum}>{r.overall ?? '—'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.relNames}>
                      {r.name_a} · {r.name_b}
                    </Text>
                    <Text style={styles.relKw}>{r.keyword}</Text>
                  </View>
                  <Badge
                    text={r.paid ? t('rc_open') : t('rc_locked')}
                    tone={r.paid ? 'success' : 'gold'}
                  />
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        <Divider style={{ marginVertical: spacing.xl }} />

        <Text style={styles.acctH}>{t('acct_title')}</Text>
        <Text style={styles.acctDesc}>{t('acct_desc')}</Text>
        <Button title={t('acct_export')} variant="outline" onPress={doExport} style={{ marginTop: 12 }} />
        <Button title={t('nav_logout')} variant="ghost" onPress={async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); }} style={{ marginTop: 8 }} />
        <Pressable onPress={doDelete} style={{ marginTop: spacing.md }}>
          <Text style={styles.delete}>{t('acct_delete')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { fontSize: 14, color: colors.text3, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  credits: { fontSize: 14, color: colors.text2, fontWeight: '600' },
  sectionH: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: spacing.xl, marginBottom: 4 },
  emptyT: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 6 },
  emptyD: { fontSize: 13, color: colors.text3, marginTop: 6, textAlign: 'center' },
  relCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  relScore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relScoreNum: { fontSize: 16, fontWeight: '900', color: colors.gold, writingDirection: 'ltr' },
  relNames: { fontSize: 15, fontWeight: '700', color: colors.text },
  relKw: { fontSize: 13, color: colors.text3, marginTop: 2 },
  acctH: { fontSize: 15, fontWeight: '800', color: colors.text },
  acctDesc: { fontSize: 13, color: colors.text3, marginTop: 6, lineHeight: 20 },
  delete: { fontSize: 13, color: colors.danger, textAlign: 'center', fontWeight: '600' },
});
