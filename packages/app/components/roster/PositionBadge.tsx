import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { POSITION_COLORS } from '../../constants/theme';

interface PositionBadgeProps {
  position: string;
  size?: 'sm' | 'md';
}

export function PositionBadge({ position, size = 'md' }: PositionBadgeProps) {
  const colors = POSITION_COLORS[position] || { bg: '#33333322', text: '#999' };
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: colors.text }]}>
        {position}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 36,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    width: 28,
    height: 18,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9,
  },
});
