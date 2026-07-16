import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ICON_MAP: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Categories: { active: 'grid', inactive: 'grid-outline' },
  Cart: { active: 'cart', inactive: 'cart-outline' },
  Debt: { active: 'wallet', inactive: 'wallet-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const containerWidth = useRef(0);
  const ACTIVE_FLEX = 2;

  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 4 }]} onLayout={onContainerLayout}>
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;
          const icons = ICON_MAP[route.name];
          const iconName = isFocused ? icons?.active : icons?.inactive;
          const iconColor = isFocused ? Colors.primary : '#9ca3af';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              LayoutAnimation.configureNext({
                duration: 350,
                update: { type: LayoutAnimation.Types.easeInEaseOut },
              });
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={[styles.tab, { flex: isFocused ? ACTIVE_FLEX : 1 }]}
            >
              {isFocused && (
                <LinearGradient
                  colors={['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={styles.tabContent}>
                <Ionicons
                  name={iconName || 'help-circle-outline'}
                  size={22}
                  color={iconColor}
                  style={isFocused ? styles.iconActive : styles.iconInactive}
                />
                {isFocused && (
                  <Text style={styles.tabLabel} numberOfLines={1}>
                    {label as string}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#ffffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 4,
    paddingTop: 5,
    paddingHorizontal: 12,
    minHeight: 60,
  },
  tabsRow: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    opacity: 1,
  },
  iconInactive: {
    opacity: 0.4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
});
