import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: '📊' },
  { name: 'Explore', href: '/app/explore', icon: '🔍' },
  { name: 'My Projects', href: '/app/projects', icon: '📁' },
  { name: 'Messages', href: '/app/chat', icon: '💬' },
  { name: 'Profile', href: '/app/profile', icon: '👤' }
];

export function AppSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2 rounded-lg text-sm
              ${isActive 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <span>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}