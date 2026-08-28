// components/PersonForm.js — birth-info form for one person (you / TA).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../i18n';
import { Field, Chip } from './ui';
import { colors, spacing } from '../theme';

// value: {name, gender, date, time, place}
export default function PersonForm({ title, value, onChange }) {
  const { t } = useI18n();
  const set = (k) => (v) => onChange({ ...value, [k]: v });

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>

      <Field
        label={t('f_name')}
        value={value.name}
        onChangeText={set('name')}
        placeholder={title}
      />

      <Text style={styles.label}>{t('f_gender')}</Text>
      <View style={styles.genderRow}>
        <Chip
          label={t('g_female')}
          active={value.gender === 'female'}
          onPress={() => set('gender')('female')}
        />
        <Chip
          label={t('g_male')}
          active={value.gender === 'male'}
          onPress={() => set('gender')('male')}
        />
      </View>

      <Field
        label={t('f_date')}
        value={value.date}
        onChangeText={set('date')}
        placeholder="1998-06-15"
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field
            label={t('f_time')}
            value={value.time}
            onChangeText={set('time')}
            placeholder="12:00"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1.4 }}>
          <Field
            label={t('f_place')}
            value={value.place}
            onChangeText={set('place')}
            placeholder="—"
          />
        </View>
      </View>
    </View>
  );
}

export const emptyPerson = (gender = 'female') => ({
  name: '',
  gender,
  date: '',
  time: '12:00',
  place: '',
});

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surface2,
    marginBottom: spacing.md,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text2, marginBottom: 6 },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.md },
  row: { flexDirection: 'row' },
});
