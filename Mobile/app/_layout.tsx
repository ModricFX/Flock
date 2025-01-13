import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { toastConfig } from './styles/toastConfig';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Navigation Stack */}
      <Stack initialRouteName="index">
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            headerLeft: () => null,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="tabs"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>

      {/* Toast Component */}
      <Toast
        config={toastConfig}
      />

      {/* Status Bar */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
