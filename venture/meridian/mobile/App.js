// App.js — root: SafeArea + I18n + Auth providers, native-stack navigation.
import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider, useI18n } from './src/i18n';
import { AuthProvider, useAuth } from './src/lib/auth';
import { colors } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import FunnelScreen from './src/screens/FunnelScreen';
import ReportScreen from './src/screens/ReportScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import AuthScreen from './src/screens/AuthScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.gold },
};

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgTint, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

function Root() {
  const { ready: i18nReady } = useI18n();
  const { ready: authReady } = useAuth();
  if (!i18nReady || !authReady) return <Splash />;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Funnel" component={FunnelScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Account" component={AccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
