import { useLocation, Navigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Container } from '../../components/layout/Container';
import { AuthCard } from '../../components/auth/AuthCard';
import { LoginForm } from '../../components/auth/LoginForm';
import { SignupForm } from '../../components/auth/SignupForm';
import { AuthToggle } from '../../components/auth/AuthToggle';

export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.hash === '#login';
  
  if (!location.hash) {
    return <Navigate to="/auth#login" replace />;
  }

  return (
    <PageLayout>
      <Container>
        <div className="max-w-2xl mx-auto pt-12">
          <AuthCard title={isLogin ? 'Welcome Back' : 'Create Account'}>
            {isLogin ? <LoginForm /> : <SignupForm />}
            <AuthToggle isLogin={isLogin} />
          </AuthCard>
        </div>
      </Container>
    </PageLayout>
  );
}