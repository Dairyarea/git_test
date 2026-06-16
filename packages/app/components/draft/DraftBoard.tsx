import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DraftState, DraftPick } from '@ff/shared';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { PositionBadge } from '../roster/PositionBadge';

interface DraftBoardProps {
  draft: DraftState;
  myTeamId: string;
}

export function DraftBoard({ draft, myTeamId }: DraftBoardProps) {
  const teamCount = draft.draftOrder.length;

  const grid: (DraftPick | null)[][] = Array.from({ length: draft.rounds }, (_, round) =>
    Array.from({ length: teamCount }, (_, pos) => {
      const pickNum =
        draft.type === 'SNAKE' && round % 2 === 1
          ? round * teamCount + (teamCount - 1 - pos) + 1
          : round * teamCount + pos + 1;
      return draft.picks.find((p) => p.pick === pickNum) || null;
    }),
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.board}>
          <View style={styles.headerRow}>
            <View style={styles.roundLabel} />
            {draft.draftOrder.map((teamId) => (
              <View key={teamId} style={[styles.cell, teamId === myTeamId && styles.myTeamHeader]}>
                <Text style={styles.teamHeaderText} numberOfLines={1}>
                  {teamId === myTeamId ? 'You' : `Team ${draft.draftOrder.indexOf(teamId) + 1}`}
                </Text>
              </View>
            ))}
          </View>

          {grid.map((row, round) => (
            <View key={round} style={styles.row}>
              <View style={styles.roundLabel}>
                <Text style={styles.roundText}>R{round + 1}</Text>
              </View>
              {row.map((pick, pos) => {
                const teamId = draft.draftOrder[pos];
                const isOnClock =
                  !pick &&
                  draft.picks.length === round * teamCount + pos;

                return (
                  <View
                    key={pos}
                    style={[
                      styles.cell,
                      teamId === myTeamId && styles.myTeamCell,
                      isOnClock && styles.onClock,
                    ]}
                  >
                    {pick ? (
                      <>
                        <PositionBadge position={pick.player.position} size="sm" />
                        <Text style={styles.pickName} numberOfLines={1}>
                          {pick.player.lastName}
                        </Text>
                      </>
                    ) : isOnClock ? (
                      <Text style={styles.onClockText}>⏱</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  board: {},
  headerRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  roundLabel: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
  cell: {
    width: 80,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 2,
  },
  myTeamCell: {
    backgroundColor: COLORS.primary + '22',
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  myTeamHeader: {
    backgroundColor: COLORS.primary + '33',
  },
  teamHeaderText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  pickName: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
    fontSize: 10,
  },
  onClock: {
    backgroundColor: COLORS.warning + '33',
    borderWidth: 1.5,
    borderColor: COLORS.warning,
  },
  onClockText: {
    fontSize: 20,
  },
});
