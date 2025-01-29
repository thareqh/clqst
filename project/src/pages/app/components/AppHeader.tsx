import { ProfileMenu } from '../../../components/profile/ProfileMenu';
import { Logo } from '../../../components/Logo';

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        <Logo />
        <ProfileMenu />
      </div>
    </header>
  );
}