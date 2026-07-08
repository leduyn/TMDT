export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export type GuideStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface GuideCondition {
  role?: string[];
  minAppVersion?: string;
  predicate?: () => boolean | Promise<boolean>;
}

export interface GuideStep {
  id: string;
  screen: string;
  target: string;
  title: string;
  description: string;
  placement: Placement;
  order: number;
  navigateTo?: { screen: string; params?: Record<string, any> };
  spotlightPadding?: number;
}

export interface GuideDefinition {
  id: string;
  version: number;
  title: string;
  steps: GuideStep[];
  condition?: GuideCondition;
}

export interface TargetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

export interface CompletedGuide {
  version: number;
  completedAt: number;
}
