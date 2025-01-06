import { Button } from './Button';

interface AuthButtonProps {
  variant?: 'primary' | 'outline';
  className?: string;
}

export function AuthButton({ variant = 'primary', className = '' }: AuthButtonProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        className={`${className} border-2`}
        href="/auth#signup"
      >
        Sign Up
      </Button>
      <Button
        variant={variant}
        className={className}
        href="/auth#login"
      >
        Sign In
      </Button>
    </div>
  );
}