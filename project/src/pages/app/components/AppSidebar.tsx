import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: '📊' },
  { name: 'Explore', href: '/app/explore', icon: '🔍' },
  { name: 'My Projects', href: '/app/projects', icon: '📁' },
  { name: 'Messages', href: '/app/chat', icon: '💬' },
  { name: 'Profile', href: '/app/profile', icon: '👤' }
];

export function AppSidebar() {
  const sidebarContent = (
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
  );

  const mobileNavContent = (
    <nav className="h-full px-4 flex justify-between items-center max-w-lg mx-auto">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) => `
            relative flex flex-col items-center gap-1 p-2 w-[4.5rem]
            ${isActive 
              ? 'text-gray-900' 
              : 'text-gray-400 hover:text-gray-600'}
          `}
        >
          {({ isActive }) => (
            <motion.div
              className="flex flex-col items-center w-full"
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-2xl relative z-10">{item.icon}</span>
              <span className="text-[10px] font-medium relative z-10 truncate w-full text-center">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="bubble"
                  className="absolute inset-0 bg-gray-100 rounded-lg -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed top-16 left-0 w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        {mobileNavContent}
      </div>
    </>
  );
}