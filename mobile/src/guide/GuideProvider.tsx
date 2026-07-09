import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { findNodeHandle, UIManager, Platform, Alert, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GuideDefinition, GuideStep, TargetLayout, CompletedGuide } from './types';
import { registerGuide, getGuide, getAllGuides, loadGuidesFromApi } from './GuideRegistry';
import { categoryGuide } from './guides/categoryGuide';
import { guideApi } from '../api/guide';
import { useAuth } from '../context/AuthContext';

const GUIDE_PREFIX = 'guide.completed.';

export interface GuideContextType {
  isRunning: boolean;
  currentStep: GuideStep | null;
  currentStepIndex: number;
  activeGuide: GuideDefinition | null;
  targetLayout: TargetLayout | null;
  targetRefs: React.MutableRefObject<Map<string, any[]>>;

  startGuide: (id: string) => Promise<void>;
  nextStep: (navigate?: (screen: string, params?: any) => void) => void;
  previousStep: () => void;
  skip: () => void;
  finish: () => void;
  stopGuide: () => void;
  registerTarget: (id: string, ref: any) => void;
  unregisterTarget: (id: string, ref?: any) => void;
  measureTarget: (id: string) => Promise<TargetLayout | null>;
}

export const GuideContext = createContext<GuideContextType>({} as GuideContextType);

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const { agencyId, userRole } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeGuide, setActiveGuide] = useState<GuideDefinition | null>(null);
  const [targetLayout, setTargetLayout] = useState<TargetLayout | null>(null);
  const targetRefs = useRef<Map<string, any[]>>(new Map());
  const completedGuides = useRef<Set<string>>(new Set());

  useEffect(() => {
    registerGuide(categoryGuide);
    loadCompletedGuides();
    fetchActiveGuides();
  }, []);

  const fetchActiveGuides = async () => {
    try {
      const activeGuides = await guideApi.getActive();
      if (activeGuides && activeGuides.length > 0) {
        loadGuidesFromApi(activeGuides);
      }
    } catch {
      // Silently fail — guides will still work via registered hardcoded guides
    }
  };

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

  const measureSingleRef = useCallback((ref: any): Promise<TargetLayout | null> => {
    return new Promise(resolve => {
      if (!ref) { resolve(null); return; }

      if (Platform.OS === 'web') {
        const node = findNodeHandle(ref) as any;
        if (node && typeof node.getBoundingClientRect === 'function') {
          const rect = node.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            resolve({ x: rect.left, y: rect.top, width: rect.width, height: rect.height, pageX: rect.left, pageY: rect.top });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
        return;
      }

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

  const measureTarget = useCallback(async (targetId: string): Promise<TargetLayout | null> => {
    const refs = targetRefs.current.get(targetId);
    if (!refs || refs.length === 0) return null;

    for (const ref of refs) {
      const layout = await measureSingleRef(ref);
      if (layout) return layout;
    }
    return null;
  }, [measureSingleRef]);

  const measureCurrentTarget = useCallback(async (retries = 3) => {
    if (!activeGuide) { console.log('GUIDE_DEBUG: measureCurrentTarget - no activeGuide'); return; }
    const step = activeGuide.steps[currentStepIndex];
    if (!step) { console.log('GUIDE_DEBUG: measureCurrentTarget - no step at index', currentStepIndex); return; }
    console.log('GUIDE_DEBUG: measuring target', step.target, 'retries left', retries);
    const layout = await measureTarget(step.target);
    if (layout) {
      console.log('GUIDE_DEBUG: got layout', layout);
      setTargetLayout(layout);
    } else if (retries > 0) {
      console.log('GUIDE_DEBUG: retrying in 500ms');
      setTimeout(() => measureCurrentTarget(retries - 1), 500);
    } else {
      console.log('GUIDE_DEBUG: gave up measuring target after retries');
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
    console.log('GUIDE_DEBUG: startGuide called with id', id);
    console.log('GUIDE_DEBUG: registry has keys', Array.from(getAllGuides().map(g => g.id)));
    const guide = getGuide(id);
    if (!guide) { console.log('GUIDE_DEBUG: guide not found in registry'); Alert.alert('Debug', `Guide "${id}" not found`); return; }
    console.log('GUIDE_DEBUG: found guide', guide.title, 'steps:', guide.steps.length);

    if (guide.condition?.role && guide.condition.role.length > 0) {
      console.log('GUIDE_DEBUG: checking role', userRole, 'against', guide.condition.role);
      if (!userRole || !guide.condition.role.includes(userRole)) { Alert.alert('Debug', `Role mismatch: userRole=${userRole}, required=${guide.condition.role}`); return; }
      if (userRole === 'AGENCY' && !agencyId) { Alert.alert('Debug', 'Agency ID is null'); return; }
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
    const existing = targetRefs.current.get(id);
    if (existing) {
      if (!existing.includes(ref)) {
        existing.push(ref);
      }
    } else {
      targetRefs.current.set(id, [ref]);
    }
  }, []);

  const unregisterTarget = useCallback((id: string, ref?: any) => {
    if (ref) {
      const existing = targetRefs.current.get(id);
      if (existing) {
        const filtered = existing.filter(r => r !== ref);
        if (filtered.length > 0) {
          targetRefs.current.set(id, filtered);
        } else {
          targetRefs.current.delete(id);
        }
      }
    } else {
      targetRefs.current.delete(id);
    }
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
