import { PROJECT_CATEGORIES } from '../../../../../constants/projectCategories';

interface CategorySelectProps {
  value: string;
  onChange: (value: "web" | "mobile" | "desktop" | "other") => void;
  className?: string;
}

export function CategorySelect({ value, onChange, className = '' }: CategorySelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as "web" | "mobile" | "desktop" | "other")}
        className="w-full px-4 py-2 rounded-xl border appearance-none"
      >
        {PROJECT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          );
        })}
      </select>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        {(() => {
          const selectedCategory = PROJECT_CATEGORIES.find(c => c.id === value);
          if (!selectedCategory) return null;
          const Icon = selectedCategory.icon;
          return <Icon className="w-4 h-4 text-gray-500" />;
        })()}
      </div>
    </div>
  );
} 