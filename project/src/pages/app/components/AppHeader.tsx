import { ProfileMenu } from '../../../components/profile/ProfileMenu';
import { Logo } from '../../../components/Logo';

export function AppHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        <Logo />
        <ProfileMenu />
      </div>
    </header>
  );
}