import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Categories: { active: 'grid', inactive: 'grid-outline' },
  Cart: { active: 'cart', inactive: 'cart-outline' },
  Debt: { active: 'wallet', inactive: 'wallet-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const FLOATING_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home', Categories: 'grid', Cart: 'cart', Debt: 'wallet', Profile: 'person',
};

const BAR_HEIGHT = 62;
const BTN_SIZE = 50;
const BTN_RADIUS = BTN_SIZE / 2;
const CUT_RADIUS = 28;
const CUT_DEPTH = 32;

export function CustomTabBar2({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const translateX = useRef(new Animated.Value(0)).current;
  const floatScale = useRef(new Animated.Value(1)).current;
  const floatTranslateY = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const tabCenters = useRef<number[]>([]);
  const containerWidth = useRef(0);
  const [pathD, setPathD] = useState('');
  const [floatIcon, setFloatIcon] = useState<keyof typeof Ionicons.glyphMap>('home');

  const activeRouteName = state.routes[state.index]?.name;

  const buildPath = (cx: number, W: number) => {
    const curveWidth = 48;  // Mở rộng tối đa
    const curveDepth = 32;  // Đảm bảo độ sâu tương ứng

    return `
    M 0,0 
    L ${cx - curveWidth},0 
    C ${cx - curveWidth + 20},0 ${cx - 22},${curveDepth} ${cx},${curveDepth}
    C ${cx + 22},${curveDepth} ${cx + curveWidth - 20},0 ${cx + curveWidth},0
    L ${W},0 
    L ${W},${BAR_HEIGHT} 
    L 0,${BAR_HEIGHT} 
    Z
  `;
  };

  const animateTo = (index: number) => {
    const targetX = tabCenters.current[index];
    if (targetX === undefined) return;

    const route = state.routes[index];
    const nextIcon = FLOATING_ICONS[route?.name] || 'help';
    const W = containerWidth.current || 375;
    setPathD(buildPath(targetX, W));
    setFloatIcon(nextIcon);

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: targetX - BTN_RADIUS,
        damping: 18,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(iconOpacity, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(floatScale, {
            toValue: 1.2,
            damping: 8,
            stiffness: 200,
            useNativeDriver: true,
          }),
          Animated.spring(floatTranslateY, {
            toValue: -14,
            damping: 8,
            stiffness: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(floatScale, {
            toValue: 1,
            damping: 12,
            stiffness: 180,
            useNativeDriver: true,
          }),
          Animated.spring(floatTranslateY, {
            toValue: 0,
            damping: 12,
            stiffness: 180,
            useNativeDriver: true,
          }),
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  };

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    containerWidth.current = w;
    const center = w / state.routes.length / 2;
    tabCenters.current[0] = center;

    const firstRoute = state.routes[0];
    if (firstRoute) setFloatIcon(FLOATING_ICONS[firstRoute.name] || 'help');

    translateX.setValue(center - BTN_RADIUS);
    setPathD(buildPath(center, w));
  };

  const onTabLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabCenters.current[index] = x + width / 2;
    if (index === 0 && tabCenters.current[0]) {
      const cx = tabCenters.current[0];
      translateX.setValue(cx - BTN_RADIUS);
      setPathD(buildPath(cx, containerWidth.current || 375));
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: 0 }]} onLayout={onContainerLayout}>
      <Animated.View
        style={[
          styles.floatingBtn,
          {
            transform: [
              { translateX },
              { translateY: floatTranslateY },
              { scale: floatScale },
            ],
          },
        ]}
      >
        <Animated.View style={{ opacity: iconOpacity }}>
          <Ionicons name={floatIcon} size={24} color="#ffffff" />
        </Animated.View>
      </Animated.View>

      <View style={styles.bar}>
        <Svg width="100%" height={BAR_HEIGHT} style={styles.svgOverlay}>
          <Path d={pathD} fill={Colors.primary} />
        </Svg>

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
            const icons = TAB_ICONS[route.name];
            const iconName = isFocused ? icons?.active : icons?.inactive;

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    animateTo(index);
                    navigation.navigate(route.name);
                  }
                }}
                onLayout={(e) => onTabLayout(index, e)}
                style={styles.tab}
              >
                <Ionicons
                  name={iconName || 'help-circle-outline'}
                  size={22}
                  color={isFocused ? '#ffffff' : 'rgba(255,255,255,0.55)'}
                  style={isFocused && { opacity: 0 }}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.55)' },
                    isFocused && { opacity: 0 },
                  ]}
                  numberOfLines={1}
                >
                  {label as string}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {/* 3. ĐÂY LÀ PHẦN QUYẾT ĐỊNH: View đệm Safe Area có màu Primary */}
      <View
        style={{
          width: '100%',
          height: insets.bottom, // Độ cao bằng đúng phần đệm an toàn
          backgroundColor: Colors.primary, // Đổi màu này thành màu Primary của bạn (Ví dụ: màu xanh lá)
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    //backgroundColor: '#1C1C1E',
  },
  floatingBtn: {
    position: 'absolute',
    top: -BTN_RADIUS + 4,
    left: 0,
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_RADIUS,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  bar: {
    width: '100%',
    height: BAR_HEIGHT,
    position: 'relative',
    backgroundColor: 'transparent',
    //backgroundColor: 'blue',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: CUT_DEPTH - 15,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
