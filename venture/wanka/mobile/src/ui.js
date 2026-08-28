// Minimal reusable UI primitives — no extra deps.
import React from 'react';
import { Text, TouchableOpacity, View, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { C, R } from './theme';

export function Btn({ title, onPress, ghost, disabled, loading, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={disabled || loading ? undefined : onPress}
      style={[
        s.btn,
        ghost && s.btnGhost,
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}>
      {loading
        ? <ActivityIndicator color={ghost ? C.ink : '#fff'} />
        : <Text style={[s.btnTxt, ghost && { color: C.ink }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, multiline, keyboardType, autoCapitalize }) {
  return (
    <View style={{ marginTop: 10 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        style={[s.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.mut}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'none'}
      />
    </View>
  );
}

export function Pill({ label, on, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.pill, on && s.pillOn]}>
      <Text style={{ color: on ? '#fff' : C.ink, fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function H1({ children }) { return <Text style={s.h1}>{children}</Text>; }
export function H2({ children }) { return <Text style={s.h2}>{children}</Text>; }
export function Muted({ children, style }) { return <Text style={[{ color: C.mut }, style]}>{children}</Text>; }

const s = StyleSheet.create({
  btn: { backgroundColor: C.brand, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.line },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: R, padding: 16, marginTop: 12 },
  label: { color: C.mut, fontSize: 13, marginBottom: 5 },
  input: { backgroundColor: '#0e1017', borderWidth: 1, borderColor: C.line, color: C.ink, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  pill: { borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, marginBottom: 8, backgroundColor: '#0e1017' },
  pillOn: { backgroundColor: C.brand, borderColor: C.brand },
  h1: { color: C.ink, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  h2: { color: C.ink, fontSize: 20, fontWeight: '700', marginBottom: 6 },
});
