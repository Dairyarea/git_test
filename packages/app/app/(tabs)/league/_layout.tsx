import { Tabs } from 'expo-router';
import { COLORS } from '../../../constants/theme';

export default function LeagueTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 44,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="standings" options={{ title: 'Standings' }} />
      <Tabs.Screen name="scoreboard" options={{ title: 'Scoreboard' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
    </Tabs>
  );
}
