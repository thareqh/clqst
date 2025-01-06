export const PROJECT_PHASES = [
  { id: 'idea', name: 'Idea Phase', description: 'Initial concept and planning stage' },
  { id: 'prototype', name: 'Prototype Phase', description: 'Building and testing prototypes' },
  { id: 'development', name: 'Development Phase', description: 'Active development and implementation' },
  { id: 'growth', name: 'Growth Phase', description: 'Scaling and expanding the project' },
  { id: 'maintenance', name: 'Maintenance Phase', description: 'Maintaining and improving the project' }
] as const;

export type ProjectPhase = typeof PROJECT_PHASES[number]['id'];