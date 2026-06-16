import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { usePlayerSearch } from '../../hooks/useRoster';
import { PlayerCard } from '../roster/PlayerCard';
import { Skeleton } from '../ui/Skeleton';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface PlayerSearchProps {
  leagueId?: string;
  onSelect: (playerId: string) => void;
  excludeIds?: string[];
}

export function PlayerSearch({ leagueId, onSelect, excludeIds = [] }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const { data: players, isLoading } = usePlayerSearch(query, leagueId);

  const filtered = players?.filter((p) => !excludeIds.includes(p.id)) ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search players..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} height={60} borderRadius={12} style={{ marginBottom: 8 }} />)}
        </View>
      ) : filtered.length === 0 && query.length > 0 ? (
        <Text style={styles.empty}>No players found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              onAction={item.isOwned ? undefined : () => onSelect(item.id)}
              actionIcon="add-circle"
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  skeletons: { gap: 8 },
  empty: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
