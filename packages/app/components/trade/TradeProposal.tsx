import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Team, RosterSlot } from '@ff/shared';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { PlayerCard } from '../roster/PlayerCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Ionicons } from '@expo/vector-icons';

interface TradeProposalProps {
  myTeam: Team;
  theirTeam: Team;
  onSubmit: (send: string[], receive: string[], notes?: string) => void;
  isSubmitting?: boolean;
}

export function TradeProposal({ myTeam, theirTeam, onSubmit, isSubmitting }: TradeProposalProps) {
  const [sending, setSending] = useState<string[]>([]);
  const [receiving, setReceiving] = useState<string[]>([]);

  const toggleSend = (playerId: string) => {
    setSending((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  };

  const toggleReceive = (playerId: string) => {
    setReceiving((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Your Roster</Text>
          <Text style={styles.columnHint}>Tap to send</Text>
          {myTeam.roster?.filter((s) => s.slotType !== 'BN' || true).map((slot) => (
            <TouchableOpacity
              key={slot.id}
              onPress={() => toggleSend(slot.playerId)}
              activeOpacity={0.8}
            >
              <View style={[styles.slotCard, sending.includes(slot.playerId) && styles.selected]}>
                <PlayerCard player={slot.player} compact />
                {sending.includes(slot.playerId) && (
                  <View style={styles.checkOverlay}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.danger} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.arrowCol}>
          <Ionicons name="swap-horizontal" size={24} color={COLORS.textMuted} />
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>{theirTeam.name}</Text>
          <Text style={styles.columnHint}>Tap to receive</Text>
          {theirTeam.roster?.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              onPress={() => toggleReceive(slot.playerId)}
              activeOpacity={0.8}
            >
              <View style={[styles.slotCard, receiving.includes(slot.playerId) && styles.selectedGreen]}>
                <PlayerCard player={slot.player} compact />
                {receiving.includes(slot.playerId) && (
                  <View style={styles.checkOverlay}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {(sending.length > 0 || receiving.length > 0) && (
        <Card style={styles.summary}>
          <Text style={styles.summaryTitle}>Trade Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You send: </Text>
            <Text style={styles.summaryCount}>{sending.length} player(s)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You receive: </Text>
            <Text style={styles.summaryCount}>{receiving.length} player(s)</Text>
          </View>
        </Card>
      )}

      <Button
        label="Propose Trade"
        onPress={() => onSubmit(sending, receiving)}
        disabled={sending.length === 0 || receiving.length === 0}
        loading={isSubmitting}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  columns: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  arrowCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  columnTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  columnHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  slotCard: {
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.danger,
  },
  selectedGreen: {
    borderColor: COLORS.accent,
  },
  checkOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  summary: {
    marginBottom: 16,
  },
  summaryTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  summaryCount: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  submitBtn: {
    marginBottom: 40,
  },
});
