// components/LangSwitcher.js — 8-language real-time switcher (globe dropdown).
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useI18n } from '../i18n';
import { colors, radius, spacing, shadow } from '../theme';

export default function LangSwitcher({ compact = false, inverse = false }) {
  const { lang, setLang, locales, meta } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor: inverse ? colors.lineDark : colors.line,
            backgroundColor: inverse ? 'rgba(255,255,255,0.06)' : colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
          compact && { paddingHorizontal: 10, paddingVertical: 7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Text style={[styles.globe, inverse && { color: colors.textInv }]}>🌐</Text>
        {!compact && (
          <Text style={[styles.triggerText, inverse && { color: colors.textInv }]}>
            {meta.native}
          </Text>
        )}
        <Text style={[styles.caret, inverse && { color: colors.textInv2 }]}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.menuTitle}>Language · 语言</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {locales.map((l) => {
                const active = l.code === lang;
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.opt,
                      active && { backgroundColor: colors.goldSoft },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={[styles.optNative, active && { color: colors.gold }]}>
                      {l.native}
                    </Text>
                    <Text style={styles.optLabel}>{l.label}</Text>
                    {active ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  globe: { fontSize: 15 },
  triggerText: { fontSize: 14, fontWeight: '600', color: colors.text },
  caret: { fontSize: 10, color: colors.text3, marginLeft: 2 },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menu: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.sm,
    ...shadow.lg,
  },
  menuTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.text3,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    gap: 10,
  },
  optNative: { fontSize: 16, fontWeight: '700', color: colors.text },
  optLabel: { fontSize: 13, color: colors.text3, flex: 1 },
  check: { fontSize: 16, color: colors.gold, fontWeight: '800' },
});
