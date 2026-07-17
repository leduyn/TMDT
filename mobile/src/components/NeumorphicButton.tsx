import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NeumorphicButtonProps {
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function NeumorphicButton({ onPress, iconName, label, iconColor = '#000000', textColor = '#000000', style }: NeumorphicButtonProps) {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={styles.outerBorder}>
          <LinearGradient colors={['#F5F5F5', '#FFFFFF']} style={styles.gradient}>
            <View style={styles.innerBorder}>
              <View style={styles.contentRow}>
                <Ionicons name={iconName} size={20} color={iconColor} />
                <Text style={[styles.label, { color: textColor }]}>{label}</Text>
              </View>
            </View>
            <LinearGradient
              colors={['rgba(0,0,0,0.06)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  outerBorder: {
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(225, 225, 225, 0.75)', // Màu xám/trắng bán trong suốt
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  innerBorder: {
    borderRadius: 36, // Bo góc nhỏ hơn viền ngoài một chút để khít
    borderWidth: 1.5,
    borderColor: '#FFFFFF', // Viền trắng tinh tạo điểm nhấn phản chiếu ánh sáng
    overflow: 'hidden',
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  gradient: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 10,
  },
  label: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700', // Chữ đậm nét rõ ràng
    letterSpacing: -0.3,
  },
});
