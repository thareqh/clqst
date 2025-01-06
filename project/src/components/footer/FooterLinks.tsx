interface LinkGroup {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const linkGroups: LinkGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Solutions", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Pricing", href: "#" },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Guides", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Community", href: "#" },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ]
  }
];

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {linkGroups.map((group) => (
        <div key={group.title}>
          <h3 className="font-medium mb-4">{group.title}</h3>
          <ul className="space-y-3">
            {group.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 group"
                >
                  {link.label}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}