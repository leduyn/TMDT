import React, { useEffect, useRef, useContext } from 'react';
import {
  View, StyleSheet, Animated, Dimensions,
  Pressable, Platform,
} from 'react-native';
import { Colors } from '../theme';
import { GuideContext } from './GuideProvider';
import { GuideHighlight } from './GuideHighlight';
import { GuideTooltip } from './GuideTooltip';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function GuideOverlay() {
  const ctx = useContext(GuideContext);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  if (!ctx.isRunning || !ctx.currentStep) return null;

  const { currentStep, currentStepIndex, activeGuide, nextStep, previousStep, skip } = ctx;
  const totalSteps = activeGuide?.steps.length ?? 0;

  const handleNext = () => {
    nextStep((screen: string, params?: any) => {
      (navigation as any).navigate(screen, params);
    });
  };

  const tl = ctx.targetLayout;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill}>
        {tl ? (
          <>
            <View style={[styles.dim, { top: 0, left: 0, right: 0, height: tl.pageY }]} />
            <View style={[styles.dim, { top: tl.pageY + tl.height, left: 0, right: 0, bottom: 0 }]} />
            <View style={[styles.dim, { top: tl.pageY, left: 0, width: tl.pageX, height: tl.height }]} />
            <View style={[styles.dim, { top: tl.pageY, left: tl.pageX + tl.width, right: 0, height: tl.height }]} />
          </>
        ) : (
          <View style={[styles.dim, StyleSheet.absoluteFill]} />
        )}
      </Pressable>

      {tl && (
        <>
          <GuideHighlight layout={tl} />
          <GuideTooltip
            title={currentStep.title}
            description={currentStep.description}
            placement={currentStep.placement}
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={previousStep}
            onSkip={skip}
            targetLayout={tl}
          />
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
});
