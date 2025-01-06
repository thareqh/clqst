interface CountryFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountryFlag({ countryCode, size = 'md' }: CountryFlagProps) {
  const sizes = {
    sm: 'w-4',
    md: 'w-5',
    lg: 'w-6'
  };

  if (!countryCode) return null;

  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
      alt={`Flag of ${countryCode}`}
      className={`${sizes[size]} aspect-[3/2] rounded-sm object-contain`}
    />
  );
} 