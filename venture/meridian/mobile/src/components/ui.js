// components/ui.js — shared UI primitives for Meridian Sync mobile.
import React from 'react';
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { colors, radius, spacing, shadow, font } from '../theme';

// ---------- Button ----------
export function Button({
  title,
  onPress,
  variant = 'primary', // primary | dark | ghost | outline
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const pal = {
    primary: { bg: colors.gold, fg: '#fff', border: colors.gold },
    dark: { bg: colors.ink, fg: colors.textInv, border: colors.ink },
    ghost: { bg: 'transparent', fg: colors.text, border: 'transparent' },
    outline: { bg: 'transparent', fg: colors.text, border: colors.lineStrong },
  }[variant] || { bg: colors.gold, fg: '#fff', border: colors.gold };

  const pad =
    size === 'lg'
      ? { paddingVertical: 16, paddingHorizontal: 24 }
      : size === 'sm'
      ? { paddingVertical: 8, paddingHorizontal: 14 }
      : { paddingVertical: 13, paddingHorizontal: 20 };

  const isPrimary = variant === 'primary' || variant === 'dark';

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        pad,
        {
          backgroundColor: pal.bg,
          borderColor: pal.border,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
        isPrimary ? shadow.sm : null,
        style,
      ]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={pal.fg} size="small" />
      ) : (
        <Text
          style={[
            styles.btnText,
            { color: pal.fg, fontSize: size === 'lg' ? 17 : 15 },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// ---------- Card ----------
export function Card({ children, style, tint = false, dark = false }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? colors.ink : tint ? colors.surface2 : colors.surface,
          borderColor: dark ? colors.lineDark : colors.line,
        },
        shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Typography ----------
export function H1({ children, style, inverse = false }) {
  return (
    <Text style={[styles.h1, inverse && { color: colors.textInv }, style]}>{children}</Text>
  );
}
export function H2({ children, style, inverse = false }) {
  return (
    <Text style={[styles.h2, inverse && { color: colors.textInv }, style]}>{children}</Text>
  );
}
export function P({ children, style, muted = false, inverse = false }) {
  return (
    <Text
      style={[
        styles.p,
        muted && { color: colors.text3 },
        inverse && { color: colors.textInv2 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Eyebrow({ children, style }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

// ---------- Chip / Pill ----------
export function Chip({ label, active = false, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.goldSoft : colors.surface,
          borderColor: active ? colors.gold : colors.line,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.gold : colors.text2 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---------- Field ----------
export function Field({ label, value, onChangeText, placeholder, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

// ---------- Divider ----------
export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}

// ---------- Badge ----------
export function Badge({ text, tone = 'gold' }) {
  const pal =
    tone === 'success'
      ? { bg: 'rgba(21,128,61,0.12)', fg: colors.success }
      : tone === 'danger'
      ? { bg: 'rgba(192,57,43,0.12)', fg: colors.danger }
      : { bg: colors.goldSoft, fg: colors.gold };
  return (
    <View style={[styles.badge, { backgroundColor: pal.bg }]}>
      <Text style={[styles.badgeText, { color: pal.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnText: { fontWeight: '700', letterSpacing: 0.2 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  h1: {
    fontSize: font.size2xl,
    lineHeight: font.size2xl * 1.18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: font.sizeXl,
    lineHeight: font.sizeXl * 1.2,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  p: {
    fontSize: font.sizeMd,
    lineHeight: font.sizeMd * 1.55,
    color: colors.text2,
  },
  eyebrow: {
    fontSize: font.sizeXs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.gold,
    fontWeight: '700',
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text2,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});

export default {
  Button,
  Card,
  H1,
  H2,
  P,
  Eyebrow,
  Chip,
  Field,
  Divider,
  Badge,
};
