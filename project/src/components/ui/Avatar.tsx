interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, alt, fallback, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-medium text-gray-600">
          {fallback}
        </span>
      )}
    </div>
  );
}