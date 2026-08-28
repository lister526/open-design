// screens/AuthScreen.js — register / login toggle.
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import Screen from '../components/Screen';
import { Button, Card, H2, P, Field } from '../components/ui';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { colors, spacing } from '../theme';

export default function AuthScreen({ route, navigation }) {
  const next = route.params?.next;
  const { t } = useI18n();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('register'); // register | login
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const isReg = mode === 'register';

  async function submit() {
    if (!email || !pass) {
      Alert.alert(t('common_unavailable'), '');
      return;
    }
    setBusy(true);
    try {
      if (isReg) await register({ email, password: pass, name });
      else await login(email, pass);
      if (next) navigation.replace(next);
      else navigation.replace('Account');
    } catch (e) {
      Alert.alert(t('common_unavailable'), e?.data?.message || e?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen onBack={() => navigation.goBack()}>
      <Card style={{ marginTop: spacing.lg }}>
        <H2>{isReg ? t('auth_reg_title') : t('auth_login_title')}</H2>
        <P muted style={{ marginTop: 8, marginBottom: spacing.md }}>
          {isReg ? t('auth_reg_sub') : t('auth_login_sub')}
        </P>

        {isReg ? (
          <Field
            label={t('auth_name')}
            value={name}
            onChangeText={setName}
            placeholder={t('auth_name_ph')}
          />
        ) : null}
        <Field
          label={t('auth_email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <Field
          label={t('auth_pass')}
          value={pass}
          onChangeText={setPass}
          placeholder={t('auth_pass_ph')}
          secureTextEntry
          autoCapitalize="none"
        />

        <Button
          title={isReg ? t('auth_create') : t('auth_login')}
          size="lg"
          loading={busy}
          onPress={submit}
          style={{ marginTop: 6 }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchTxt}>{isReg ? t('auth_have') : t('auth_no')}</Text>
          <Pressable onPress={() => setMode(isReg ? 'login' : 'register')}>
            <Text style={styles.switchLink}>{isReg ? t('auth_go_login') : t('auth_go_reg')}</Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  switchTxt: { fontSize: 14, color: colors.text3 },
  switchLink: { fontSize: 14, color: colors.gold, fontWeight: '700' },
});
