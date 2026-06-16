import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useLeagueStore } from '../../stores/leagueStore';
import { useMyLeagues } from '../../hooks/useLeague';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { League } from '@ff/shared';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { setActiveLeague } = useLeagueStore();
  const { data: leagues, isLoading, refetch, isRefetching } = useMyLeagues();

  const handleLeaguePress = (league: League) => {
    setActiveLeague(league);
    router.push('/(tabs)/roster');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hey, {user?.displayName?.split(' ')[0]} 👋</Text>
        <Text style={styles.season}>2025 Season</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Leagues</Text>
          <TouchableOpacity onPress={() => router.push('/settings/league/scoring')}>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <>
            <Skeleton height={88} borderRadius={14} style={{ marginBottom: 10 }} />
            <Skeleton height={88} borderRadius={14} style={{ marginBottom: 10 }} />
          </>
        ) : leagues?.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="football-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No leagues yet</Text>
            <Text style={styles.emptyText}>Create a new league or join one with an invite code.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-league')}>
              <Text style={styles.createBtnText}>Create League</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          leagues?.map((league: any) => (
            <TouchableOpacity key={league.id} onPress={() => handleLeaguePress(league)} activeOpacity={0.8}>
              <Card style={styles.leagueCard}>
                <View style={styles.leagueHeader}>
                  <View style={styles.leagueInfo}>
                    <Text style={styles.leagueName}>{league.name}</Text>
                    <Text style={styles.leagueMeta}>{league._count?.members ?? league.memberCount ?? '?'} teams · {league.season}</Text>
                  </View>
                  <Badge
                    label={league.role || 'MEMBER'}
                    color={league.role === 'COMMISSIONER' ? COLORS.warning + '33' : COLORS.primary + '22'}
                    textColor={league.role === 'COMMISSIONER' ? COLORS.warning : COLORS.primary}
                    size="sm"
                  />
                </View>
                {league.draftConfig?.status === 'PENDING' && (
                  <View style={styles.draftBanner}>
                    <Ionicons name="time-outline" size={14} color={COLORS.warning} />
                    <Text style={styles.draftBannerText}>Draft pending</Text>
                  </View>
                )}
                {league.draftConfig?.status === 'LIVE' && (
                  <TouchableOpacity
                    style={styles.liveBtn}
                    onPress={() => router.push(`/draft/${league.id}`)}
                  >
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBtnText}>Draft is LIVE — Join now</Text>
                  </TouchableOpacity>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.joinCard} onPress={() => router.push('/join-league')}>
        <Ionicons name="link-outline" size={20} color={COLORS.primary} />
        <Text style={styles.joinText}>Join with invite code</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { marginBottom: 28 },
  greetingText: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  season: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  leagueCard: { marginBottom: 10 },
  leagueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leagueInfo: { flex: 1 },
  leagueName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, fontSize: 17 },
  leagueMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  draftBannerText: { ...TYPOGRAPHY.captionBold, color: COLORS.warning },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: COLORS.danger + '22',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger },
  liveBtnText: { ...TYPOGRAPHY.captionBold, color: COLORS.danger },
  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
  createBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createBtnText: { ...TYPOGRAPHY.bodyBold, color: '#fff' },
  joinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  joinText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primary, flex: 1 },
});
