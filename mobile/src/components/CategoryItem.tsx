import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../theme';
import { resolveImageUrl } from '../utils';

interface CategoryItemProps {
  name: string;
  isActive?: boolean;
  onPress?: () => void;
  imageUrl?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function CategoryItem({ name, isActive, onPress, imageUrl, iconName }: CategoryItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.activeIndicator, isActive && styles.activeIndicatorVisible]} />
      <View style={styles.iconWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(imageUrl) || 'https://via.placeholder.com/32' }}
            style={styles.image}
          />
        ) : iconName ? (
          <Ionicons name={iconName} size={22} color={isActive ? Colors.primary : Colors.textSecondary} />
        ) : null}
      </View>
      <Text
        style={[styles.name, isActive && styles.nameActive]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    position: 'relative',
  },
  containerActive: {
    backgroundColor: Colors.primarySoft,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 4,
    backgroundColor: 'transparent',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  activeIndicatorVisible: {
    backgroundColor: Colors.primary,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    //backgroundColor: '#160101ff',
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  name: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  nameActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
