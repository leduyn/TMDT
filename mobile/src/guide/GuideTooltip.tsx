import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Platform, type DimensionValue,
} from 'react-native';
import { Colors, BorderRadius, Shadow } from '../theme';
import type { Placement, TargetLayout } from './types';

interface GuideTooltipProps {
  title: string;
  description: string;
  placement: Placement;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  targetLayout: TargetLayout;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function GuideTooltip({
  title,
  description,
  placement: preferredPlacement,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  targetLayout,
}: GuideTooltipProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [targetLayout]);

  const placement = resolvePlacement(preferredPlacement, targetLayout);
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const tooltipPos = getTooltipPosition(placement, targetLayout);
  const arrowStyle = getArrowStyle(placement);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.tooltip,
        { left: tooltipPos.left, top: tooltipPos.top },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.arrow, arrowStyle]} />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.progress}>{currentStep + 1}/{totalSteps}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
          <View style={styles.navButtons}>
            {!isFirst && (
              <TouchableOpacity onPress={onPrevious} style={styles.navBtn}>
                <Text style={styles.navBtnText}>{'< Trước'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onNext} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>{isLast ? 'Hoàn tất' : 'Tiếp >'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function resolvePlacement(preferred: Placement, layout: TargetLayout): Placement {
  if (preferred !== 'auto') return preferred;
  const spaceAbove = layout.pageY;
  const spaceBelow = SCREEN_H - layout.pageY - layout.height;
  const spaceLeft = layout.pageX;
  const spaceRight = SCREEN_W - layout.pageX - layout.width;
  const spaces = [
    { placement: 'bottom' as Placement, space: spaceBelow },
    { placement: 'top' as Placement, space: spaceAbove },
    { placement: 'right' as Placement, space: spaceRight },
    { placement: 'left' as Placement, space: spaceLeft },
  ];
  return spaces.sort((a, b) => b.space - a.space)[0].placement;
}

function getTooltipPosition(placement: Placement, layout: TargetLayout) {
  const tooltipW = Math.min(280, SCREEN_W - 32);
  const tooltipH = 180;
  const gap = 12;

  switch (placement) {
    case 'top':
      return {
        left: Math.max(16, Math.min(layout.pageX + layout.width / 2 - tooltipW / 2, SCREEN_W - tooltipW - 16)),
        top: Math.max(16, layout.pageY - tooltipH - gap),
      } as const;
    case 'bottom':
      return {
        left: Math.max(16, Math.min(layout.pageX + layout.width / 2 - tooltipW / 2, SCREEN_W - tooltipW - 16)),
        top: Math.min(SCREEN_H - tooltipH - 16, layout.pageY + layout.height + gap),
      } as const;
    case 'left':
      return {
        left: Math.max(16, layout.pageX - tooltipW - gap),
        top: Math.max(16, Math.min(layout.pageY + layout.height / 2 - tooltipH / 2, SCREEN_H - tooltipH - 16)),
      } as const;
    case 'right':
      return {
        left: Math.min(SCREEN_W - tooltipW - 16, layout.pageX + layout.width + gap),
        top: Math.max(16, Math.min(layout.pageY + layout.height / 2 - tooltipH / 2, SCREEN_H - tooltipH - 16)),
      } as const;
    default:
      return { left: 16, top: 16 } as const;
  }
}

function getArrowStyle(placement: Placement) {
  switch (placement) {
    case 'top':
      return { bottom: -6, left: '50%' as DimensionValue, marginLeft: -6, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.white };
    case 'bottom':
      return { top: -6, left: '50%' as DimensionValue, marginLeft: -6, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: Colors.white };
    case 'left':
      return { right: -6, top: '50%' as DimensionValue, marginTop: -6, borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: Colors.white };
    case 'right':
      return { left: -6, top: '50%' as DimensionValue, marginTop: -6, borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: Colors.white };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    zIndex: 10002,
    maxWidth: 300,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 10003,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 20,
    ...Shadow.lg,
    minWidth: 240,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
