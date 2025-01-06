interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="flex items-center justify-between p-6 border-t border-gray-200 group">
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="rounded-full w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-colors">
        →
      </div>
    </div>
  );
}