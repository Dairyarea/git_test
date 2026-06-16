import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../stores/authStore';

export default function RootLayout() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#0a1628' },
              headerTintColor: '#F1F5F9',
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: '#0a1628' },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="draft/[leagueId]" options={{ title: 'Draft Room', headerShown: true }} />
            <Stack.Screen name="trade/new" options={{ title: 'Propose Trade', presentation: 'modal' }} />
            <Stack.Screen name="trade/[tradeId]" options={{ title: 'Trade Details' }} />
            <Stack.Screen name="player/[playerId]" options={{ title: 'Player' }} />
            <Stack.Screen name="settings/league/scoring" options={{ title: 'Scoring Settings' }} />
            <Stack.Screen name="settings/league/roster" options={{ title: 'Roster Settings' }} />
            <Stack.Screen name="settings/league/draft" options={{ title: 'Draft Settings' }} />
            <Stack.Screen name="settings/league/playoffs" options={{ title: 'Playoff Settings' }} />
            <Stack.Screen name="settings/league/trade" options={{ title: 'Trade Settings' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
