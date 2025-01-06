const resources = [
  { title: 'Documentation', href: '#' },
  { title: 'API Reference', href: '#' },
  { title: 'Tutorials', href: '#' },
  { title: 'Community', href: '#' },
  { title: 'Case Studies', href: '#' }
];

export function FooterResources() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {resources.map(({ title, href }) => (
        <a
          key={title}
          href={href}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {title}
        </a>
      ))}
    </div>
  );
}