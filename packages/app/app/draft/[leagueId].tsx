import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDraft } from '../../hooks/useDraft';
import { useMyTeam } from '../../hooks/useRoster';
import { useDraftStore } from '../../stores/draftStore';
import { useAuthStore } from '../../stores/authStore';
import { DraftBoard } from '../../components/draft/DraftBoard';
import { PlayerSearch } from '../../components/draft/PlayerSearch';
import { PickQueue } from '../../components/draft/PickQueue';
import { Button } from '../../components/ui/Button';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DraftRoomScreen() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const [activeTab, setActiveTab] = useState<'board' | 'search' | 'queue'>('board');
  const { data, isLoading, liveDraft } = useDraft(leagueId);
  const { data: myTeam } = useMyTeam(leagueId);
  const { makePick, isConnected, enqueuePlayer } = useDraftStore();
  const { user } = useAuthStore();

  const draft = liveDraft || data?.config;
  const picks = liveDraft?.picks || data?.picks || [];
  const isMyPick = liveDraft?.onTheClockUserId === user?.id;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!draft) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Draft not found</Text>
      </View>
    );
  }

  if (draft.status === 'PENDING') {
    return (
      <View style={styles.waiting}>
        <Ionicons name="time-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.waitingTitle}>Draft Starting Soon</Text>
        <Text style={styles.waitingText}>
          Scheduled for {draft.scheduledAt
            ? new Date(draft.scheduledAt).toLocaleString()
            : 'TBD'}
        </Text>
        <View style={styles.draftInfo}>
          <Text style={styles.draftInfoText}>Type: {draft.type}</Text>
          <Text style={styles.draftInfoText}>Rounds: {draft.rounds}</Text>
          <Text style={styles.draftInfoText}>Timer: {draft.pickTimerSeconds}s</Text>
        </View>
      </View>
    );
  }

  if (draft.status === 'COMPLETE') {
    return (
      <View style={styles.waiting}>
        <Text style={styles.waitingTitle}>Draft Complete!</Text>
        <DraftBoard
          draft={{ ...draft, picks, timerRemaining: 0, currentRound: 1, totalPicks: 100, onTheClockTeamId: '', onTheClockUserId: '' }}
          myTeamId={myTeam?.id || ''}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isMyPick && (
        <View style={styles.onClockBanner}>
          <View style={styles.onClockDot} />
          <Text style={styles.onClockText}>It's your pick!</Text>
          {liveDraft && (
            <Text style={styles.timer}>{liveDraft.timerRemaining}s</Text>
          )}
        </View>
      )}

      {!isConnected && (
        <View style={styles.disconnectedBanner}>
          <Ionicons name="wifi-outline" size={16} color={COLORS.warning} />
          <Text style={styles.disconnectedText}>Reconnecting...</Text>
        </View>
      )}

      <View style={styles.tabs}>
        {(['board', 'search', 'queue'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'board' ? 'Board' : tab === 'search' ? 'Players' : 'My Queue'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'board' && liveDraft && (
          <DraftBoard
            draft={{ ...liveDraft, picks }}
            myTeamId={myTeam?.id || ''}
          />
        )}
        {activeTab === 'search' && (
          <PlayerSearch
            leagueId={leagueId}
            onSelect={(playerId) => {
              if (isMyPick) {
                makePick(playerId);
              } else {
                enqueuePlayer(playerId);
                setActiveTab('queue');
              }
            }}
            excludeIds={picks.map((p: any) => p.playerId)}
          />
        )}
        {activeTab === 'queue' && <PickQueue />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  waitingTitle: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  waitingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
  draftInfo: { marginTop: 16, gap: 6, alignItems: 'center' },
  draftInfoText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  onClockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '33',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '66',
  },
  onClockDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  onClockText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primary, flex: 1 },
  timer: { fontSize: 22, fontWeight: '800', color: COLORS.warning },
  disconnectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.warning + '22',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  disconnectedText: { ...TYPOGRAPHY.captionBold, color: COLORS.warning },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted },
  activeTabText: { color: COLORS.primary },
  content: { flex: 1, padding: 16 },
});
