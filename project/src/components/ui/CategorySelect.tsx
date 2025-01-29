import { PROJECT_CATEGORIES } from '../../constants/projectCategories';

interface CategorySelectProps {
  value: string;
  onChange: (value: "web" | "mobile" | "desktop" | "other") => void;
  className?: string;
}

export function CategorySelect({ value, onChange, className = '' }: CategorySelectProps) {
  const selectedCategory = PROJECT_CATEGORIES.find(c => c.id === value);
  const Icon = selectedCategory?.icon;

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as "web" | "mobile" | "desktop" | "other")}
        className="w-full pl-10 pr-4 py-2 rounded-xl border appearance-none bg-white"
      >
        {PROJECT_CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {Icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
      )}
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
} 