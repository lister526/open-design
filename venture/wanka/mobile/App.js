import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/auth';
import { C } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import StudioScreen from './src/screens/StudioScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';
import AccountScreen from './src/screens/AccountScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: C.bg, card: C.panel, text: C.ink, border: C.line, primary: C.brand },
};

function TabIcon({ label, color }) {
  return <Text style={{ fontSize: 18, color }}>{label}</Text>;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: C.bg, borderBottomColor: C.line },
        headerTitleStyle: { color: C.ink },
        headerTintColor: C.ink,
        tabBarStyle: { backgroundColor: C.panel, borderTopColor: C.line },
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.mut,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页', headerTitle: 'Wanka 万卡', tabBarIcon: ({ color }) => <TabIcon label="🏠" color={color} /> }} />
      <Tab.Screen name="Studio" component={StudioScreen} options={{ title: '创作台', tabBarIcon: ({ color }) => <TabIcon label="⚡" color={color} /> }} />
      <Tab.Screen name="Templates" component={TemplatesScreen} options={{ title: '模板', tabBarIcon: ({ color }) => <TabIcon label="🔁" color={color} /> }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: '我的', tabBarIcon: ({ color }) => <TabIcon label="👤" color={color} /> }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { booting } = useAuth();
  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={C.brand} size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer theme={navTheme}>
      <Tabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
