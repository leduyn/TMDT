import type { GuideDefinition } from './types';
import type { ApiGuideDTO } from '../api/guide';

const registry = new Map<string, GuideDefinition>();

function parseConditions(conditions?: string): GuideDefinition['condition'] {
  if (!conditions) return undefined;
  try {
    const parsed = JSON.parse(conditions);
    const result: GuideDefinition['condition'] = {};
    if (parsed.role) {
      result.role = Array.isArray(parsed.role) ? parsed.role : [parsed.role];
    }
    return result;
  } catch {
    return undefined;
  }
}

export function convertApiGuide(apiGuide: ApiGuideDTO): GuideDefinition {
  return {
    id: String(apiGuide.id),
    version: apiGuide.version,
    title: apiGuide.name,
    steps: (apiGuide.steps || []).map((step, index) => ({
      id: String(step.id),
      screen: '', // will be resolved at usage time
      target: step.targetKey || `target_${step.targetId}`,
      title: step.title,
      description: step.description || '',
      placement: step.placement as GuideDefinition['steps'][0]['placement'],
      order: step.stepOrder,
      navigateTo: step.navigateToScreen
        ? {
            screen: step.navigateToScreen,
            params: step.navigateToParams ? JSON.parse(step.navigateToParams) : undefined,
          }
        : undefined,
      spotlightPadding: 4,
    })),
    condition: parseConditions(apiGuide.conditions),
  };
}

export function registerGuide(guide: GuideDefinition): void {
  registry.set(guide.id, guide);
}

export function getGuide(id: string): GuideDefinition | undefined {
  return registry.get(id);
}

export function getAllGuides(): GuideDefinition[] {
  return Array.from(registry.values());
}

export function loadGuidesFromApi(guides: ApiGuideDTO[]): void {
  guides.forEach(apiGuide => {
    const guide = convertApiGuide(apiGuide);
    registry.set(guide.id, guide);
  });
}

export function clearGuides(): void {
  registry.clear();
}
