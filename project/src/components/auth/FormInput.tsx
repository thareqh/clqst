interface FormInputProps {
  type: 'text' | 'email' | 'password' | 'number';
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  error?: string;
}

export function FormInput({
  type,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  min,
  max,
  error
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-xl border ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}