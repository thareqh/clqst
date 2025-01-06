import { ReactNode } from 'react';

interface FooterSectionProps {
  title: string;
  children: ReactNode;
}

export function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-4">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}