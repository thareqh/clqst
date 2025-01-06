export const COLLABORATION_TYPES = [
  'Remote',
  'Hybrid',
  'On-site'
] as const;

export type CollaborationType = typeof COLLABORATION_TYPES[number];