interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}