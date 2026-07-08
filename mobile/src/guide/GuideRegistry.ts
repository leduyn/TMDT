import type { GuideDefinition } from './types';

const registry = new Map<string, GuideDefinition>();

export function registerGuide(guide: GuideDefinition): void {
  registry.set(guide.id, guide);
}

export function getGuide(id: string): GuideDefinition | undefined {
  return registry.get(id);
}

export function getAllGuides(): GuideDefinition[] {
  return Array.from(registry.values());
}

export function clearGuides(): void {
  registry.clear();
}
