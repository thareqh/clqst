import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthRedirect } from './components/auth/AuthRedirect';
import HomePage from './pages/index';
import AboutPage from './pages/about/index';
import BlogPage from './pages/blog/index';
import PartnershipPage from './pages/partnership/index';
import ContactPage from './pages/contact/index';
import AccessPage from './pages/access/index';
import AuthPage from './pages/auth/index';
import ProfilePage from './pages/profile/index';
import AppLayout from './pages/app/index';
import { UserProfile } from './pages/app/pages/UserProfile';
import { Analytics } from '@vercel/analytics/react';
import { ToastProvider } from './components/ui/toast';

console.log('App rendering');

export default function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Routes>
        {/* Public routes with auth redirect */}
        <Route path="/" element={
          <AuthRedirect>
            <HomePage />
          </AuthRedirect>
        } />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/partnership" element={<PartnershipPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/auth" element={
          <AuthRedirect>
            <AuthPage />
          </AuthRedirect>
        } />

        {/* Protected routes */}
        <Route path="/app/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="profile/:userId" element={<UserProfile />} />
        </Route>
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
      </Routes>
      <Analytics />
    </ToastProvider>
  );
}