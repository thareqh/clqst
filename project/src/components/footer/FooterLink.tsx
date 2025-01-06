import { Link } from 'react-router-dom';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

export function FooterLink({ href, children }: FooterLinkProps) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:');
  const isAnchor = href.startsWith('#');
  
  if (isExternal) {
    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {children}
      </a>
    );
  }

  if (isAnchor) {
    return (
      <a 
        href={href}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link 
      to={href}
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      {children}
    </Link>
  );
}