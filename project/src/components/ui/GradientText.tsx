interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'r' | 'br' | 'tr';
}

export function GradientText({ children, className = '', direction = 'r' }: GradientTextProps) {
  const gradientDirections = {
    r: 'bg-gradient-to-r',
    br: 'bg-gradient-to-br',
    tr: 'bg-gradient-to-tr'
  };

  return (
    <span className={`${gradientDirections[direction]} from-gray-900 to-gray-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}