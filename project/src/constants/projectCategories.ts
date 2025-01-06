export const PROJECT_CATEGORIES = [
  { id: 'web', name: 'Web Development', icon: '🌐' },
  { id: 'mobile', name: 'Mobile Development', icon: '📱' },
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'ai', name: 'AI/ML', icon: '🤖' },
  { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
  { id: 'game', name: 'Game Development', icon: '🎮' },
  { id: 'iot', name: 'IoT', icon: '📡' },
  { id: 'other', name: 'Other', icon: '💡' }
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]['id'];