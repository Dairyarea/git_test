import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDraftStore } from '../../stores/draftStore';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function PickQueue() {
  const { myQueue, dequeuePlayer } = useDraftStore();

  if (myQueue.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your queue is empty. Search and add players to auto-pick.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Queue ({myQueue.length})</Text>
      <FlatList
        data={myQueue}
        keyExtractor={(id) => id}
        renderItem={({ item, index }) => (
          <View style={styles.queueItem}>
            <Text style={styles.queueNum}>{index + 1}</Text>
            <Text style={styles.queueId} numberOfLines={1}>{item}</Text>
            <TouchableOpacity onPress={() => dequeuePlayer(item)}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 4,
    gap: 10,
  },
  queueNum: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
    width: 20,
    textAlign: 'center',
  },
  queueId: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
