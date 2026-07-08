import { useContext } from 'react';
import { GuideContext } from './GuideProvider';

export function useGuide() {
  const ctx = useContext(GuideContext);
  if (!ctx || typeof ctx.startGuide !== 'function') {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return {
    startGuide: ctx.startGuide,
    stopGuide: ctx.stopGuide,
    next: ctx.nextStep,
    previous: ctx.previousStep,
    skip: ctx.skip,
    finish: ctx.finish,
    isRunning: ctx.isRunning,
    currentStep: ctx.currentStep,
    currentStepIndex: ctx.currentStepIndex,
    totalSteps: ctx.activeGuide?.steps.length ?? 0,
  };
}
