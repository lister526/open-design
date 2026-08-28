// components/Screen.js — page scaffold: safe-area, top bar (brand + lang switcher), scroll body.
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../i18n';
import LangSwitcher from './LangSwitcher';
import { colors, spacing } from '../theme';

export function TopBar({ onBack, right, transparent = false }) {
  const { t } = useI18n();
  return (
    <View style={[styles.topbar, transparent && { backgroundColor: 'transparent', borderBottomColor: 'transparent' }]}>
      <View style={styles.brandRow}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
            <Text style={styles.backTxt}>‹</Text>
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.brand}>{t('brand_name')}</Text>
          <Text style={styles.brandSub}>{t('brand_sub')}</Text>
        </View>
      </View>
      <View style={styles.rightRow}>
        {right}
        <LangSwitcher compact />
      </View>
    </View>
  );
}

export default function Screen({
  children,
  scroll = true,
  onBack,
  right,
  showBar = true,
  contentStyle,
  bg = colors.bg,
}) {
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? { contentContainerStyle: [styles.body, contentStyle], showsVerticalScrollIndicator: false }
    : { style: [styles.body, contentStyle] };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      {showBar ? <TopBar onBack={onBack} right={right} /> : null}
      <Body {...bodyProps}>{children}</Body>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { paddingRight: 4 },
  backTxt: { fontSize: 30, color: colors.text, lineHeight: 30, marginTop: -4 },
  brand: { fontSize: 17, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  brandSub: { fontSize: 10, color: colors.gold, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
