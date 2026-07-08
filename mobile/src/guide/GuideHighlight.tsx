import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface GuideHighlightProps {
  layout: { x: number; y: number; width: number; height: number };
}

export function GuideHighlight({ layout }: GuideHighlightProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.highlight,
        {
          left: layout.x - 4,
          top: layout.y - 4,
          width: layout.width + 8,
          height: layout.height + 8,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0,32,69,0.08)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10001,
  },
});
