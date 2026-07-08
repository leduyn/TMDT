import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { findNodeHandle, UIManager, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GuideDefinition, GuideStep, TargetLayout, CompletedGuide } from './types';
import { registerGuide, getGuide } from './GuideRegistry';
import { categoryGuide } from './guides/categoryGuide';
import { useAuth } from '../context/AuthContext';

const GUIDE_PREFIX = 'guide.completed.';

export interface GuideContextType {
  isRunning: boolean;
  currentStep: GuideStep | null;
  currentStepIndex: number;
  activeGuide: GuideDefinition | null;
  targetLayout: TargetLayout | null;
  targetRefs: React.MutableRefObject<Map<string, any>>;

  startGuide: (id: string) => Promise<void>;
  nextStep: (navigate?: (screen: string, params?: any) => void) => void;
  previousStep: () => void;
  skip: () => void;
  finish: () => void;
  stopGuide: () => void;
  registerTarget: (id: string, ref: any) => void;
  unregisterTarget: (id: string) => void;
  measureTarget: (id: string) => Promise<TargetLayout | null>;
}

export const GuideContext = createContext<GuideContextType>({} as GuideContextType);

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const { agencyId, userRole } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeGuide, setActiveGuide] = useState<GuideDefinition | null>(null);
  const [targetLayout, setTargetLayout] = useState<TargetLayout | null>(null);
  const targetRefs = useRef<Map<string, any>>(new Map());
  const completedGuides = useRef<Set<string>>(new Set());

  useEffect(() => {
    registerGuide(categoryGuide);
    loadCompletedGuides();
  }, []);

  const loadCompletedGuides = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const guideKeys = keys.filter(k => k.startsWith(GUIDE_PREFIX));
      if (guideKeys.length > 0) {
        const entries = await AsyncStorage.multiGet(guideKeys);
        entries.forEach(([key]) => {
          completedGuides.current.add(key.replace(GUIDE_PREFIX, ''));
        });
      }
    } catch {
    }
  };

  const isGuideCompleted = useCallback(async (guideId: string, version: number): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(`${GUIDE_PREFIX}${guideId}`);
      if (!stored) return false;
      const data: CompletedGuide = JSON.parse(stored);
      return data.version >= version;
    } catch {
      return false;
    }
  }, []);

  const measureTarget = useCallback(async (targetId: string): Promise<TargetLayout | null> => {
    return new Promise(resolve => {
      const ref = targetRefs.current.get(targetId);
      if (!ref) { resolve(null); return; }

      if (typeof ref.measureInWindow === 'function') {
        ref.measureInWindow((x: number, y: number, width: number, height: number) => {
          if (width > 0 || height > 0) {
            resolve({ x, y, width, height, pageX: x, pageY: y });
          } else {
            resolve(null);
          }
        });
      } else {
        const handle = findNodeHandle(ref);
        if (handle == null) { resolve(null); return; }
        UIManager.measureInWindow(handle, (x: number, y: number, width: number, height: number) => {
          if (width > 0 || height > 0) {
            resolve({ x, y, width, height, pageX: x, pageY: y });
          } else {
            resolve(null);
          }
        });
      }
    });
  }, []);

  const measureCurrentTarget = useCallback(async (retries = 3) => {
    if (!activeGuide) return;
    const step = activeGuide.steps[currentStepIndex];
    if (!step) return;
    const layout = await measureTarget(step.target);
    if (layout) {
      setTargetLayout(layout);
    } else if (retries > 0) {
      setTimeout(() => measureCurrentTarget(retries - 1), 500);
    }
  }, [activeGuide, currentStepIndex, measureTarget]);

  useEffect(() => {
    if (isRunning && activeGuide) {
      const timer = setTimeout(() => {
        measureCurrentTarget(3);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isRunning, activeGuide, currentStepIndex, measureCurrentTarget]);

  const startGuide = useCallback(async (id: string) => {
    const guide = getGuide(id);
    if (!guide) { Alert.alert('Debug', `Guide "${id}" not found`); return; }

    if (guide.condition?.role && guide.condition.role.length > 0) {
      if (!userRole || !guide.condition.role.includes(userRole)) { Alert.alert('Debug', `Role mismatch: userRole=${userRole}, required=${guide.condition.role}`); return; }
      if (userRole === 'AGENCY' && !agencyId) { Alert.alert('Debug', 'Agency ID is null'); return; }
    }
    if (guide.condition?.predicate) {
      const ok = await guide.condition.predicate();
      if (!ok) return;
    }

    Alert.alert('Guide', `Starting: ${guide.title} (${guide.steps.length} steps)`);
    setActiveGuide(guide);
    setCurrentStepIndex(0);
    setTargetLayout(null);
    setIsRunning(true);
  }, [userRole, agencyId]);

  const stopGuide = useCallback(() => {
    setTargetLayout(null);
    setCurrentStepIndex(0);
    setActiveGuide(null);
    setIsRunning(false);
  }, []);

  const finishGuide = useCallback(async () => {
    if (!activeGuide) return;
    try {
      const data: CompletedGuide = {
        version: activeGuide.version,
        completedAt: Date.now(),
      };
      await AsyncStorage.setItem(`${GUIDE_PREFIX}${activeGuide.id}`, JSON.stringify(data));
      completedGuides.current.add(activeGuide.id);
    } catch {
    }
    stopGuide();
  }, [activeGuide, stopGuide]);

  const nextStep = useCallback((navigate?: (screen: string, params?: any) => void) => {
    if (!activeGuide) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= activeGuide.steps.length) {
      finishGuide();
      return;
    }
    const next = activeGuide.steps[nextIndex];
    if (next.navigateTo && navigate) {
      navigate(next.navigateTo.screen, next.navigateTo.params);
    }
    setCurrentStepIndex(nextIndex);
    setTargetLayout(null);
    setTimeout(() => {
      measureTarget(activeGuide.steps[nextIndex].target).then(layout => {
        if (layout) setTargetLayout(layout);
      });
    }, 500);
  }, [activeGuide, currentStepIndex, measureTarget, finishGuide]);

  const previousStep = useCallback(() => {
    if (!activeGuide) return;
    const prevIndex = currentStepIndex - 1;
    if (prevIndex < 0) return;
    setCurrentStepIndex(prevIndex);
    setTargetLayout(null);
  }, [activeGuide, currentStepIndex]);

  const skip = useCallback(() => {
    stopGuide();
  }, [stopGuide]);

  const finish = useCallback(() => {
    finishGuide();
  }, [finishGuide]);

  const registerTarget = useCallback((id: string, ref: any) => {
    targetRefs.current.set(id, ref);
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    targetRefs.current.delete(id);
  }, []);

  const currentStep = activeGuide ? activeGuide.steps[currentStepIndex] : null;

  return (
    <GuideContext.Provider
      value={{
        isRunning,
        currentStep,
        currentStepIndex,
        activeGuide,
        targetLayout,
        targetRefs,
        startGuide,
        nextStep,
        previousStep,
        skip,
        finish,
        stopGuide,
        registerTarget,
        unregisterTarget,
        measureTarget,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
}
