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
              activeOpacity={0.85}
              onPress={onPress}
              style={[styles.tab, { flex: isFocused ? ACTIVE_FLEX : 1 }]}
            >
              {isFocused ? (
                <View style={styles.neoShadow}>
                  <View style={styles.neoOuterBorder}>
                    <LinearGradient colors={['#F5F5F5', '#FFFFFF']} style={styles.neoGradient}>
                      <View style={styles.neoInnerBorder}>
                        <View style={styles.tabContent}>
                          <Ionicons name={iconName || 'help-circle-outline'} size={22} color={iconColor} />
                          <Text style={styles.tabLabel} numberOfLines={1}>{label as string}</Text>
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
                </View>
              ) : (
                <View style={styles.tabContent}>
                  <Ionicons
                    name={iconName || 'help-circle-outline'}
                    size={22}
                    color={iconColor}
                    style={styles.iconInactive}
                  />
                </View>
              )}
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
    minHeight: 70,
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
    borderRadius: 999,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 60,
  },
  iconActive: {
    opacity: 1,
  },
  iconInactive: {
    opacity: 0.4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  neoShadow: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  neoOuterBorder: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(200,200,200,0.3)',
    overflow: 'hidden',
  },
  neoGradient: {
    borderRadius: 999,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  neoInnerBorder: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 999,
    minHeight: 35,
    paddingHorizontal: 20,
    paddingVertical: 5,
    minWidth: 100,
  },
});
