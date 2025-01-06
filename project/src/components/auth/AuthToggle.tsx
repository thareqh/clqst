interface AuthToggleProps {
  isLogin: boolean;
}

export function AuthToggle({ isLogin }: AuthToggleProps) {
  return (
    <div className="mt-6 text-center">
      <a
        href={isLogin ? '#signup' : '#login'}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {isLogin
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </a>
    </div>
  );
}