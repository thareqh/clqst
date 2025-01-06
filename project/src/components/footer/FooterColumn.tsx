interface FooterColumnProps {
  title: string;
  children: React.ReactNode;
}

export function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex flex-col space-y-3">
        {children}
      </div>
    </div>
  );
}