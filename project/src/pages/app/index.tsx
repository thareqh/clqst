import { Routes, Route, useLocation } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/Projects/pages/CreateProject';
import { ProjectDetails } from './pages/Projects/pages/ProjectDetails';
import { Chat } from './pages/Chat/index';
import Explore from './pages/Explore';
import { Profile } from './pages/Profile';
import { UserProfile } from './pages/UserProfile';
import { Notifications } from './pages/Notifications';
import Settings from './pages/Settings';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-8 lg:pl-72">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes location={location}>
                <Route path="" element={<Dashboard />} />
                <Route path="explore" element={<Explore />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/create" element={<CreateProject />} />
                <Route path="projects/:id/*" element={<ProjectDetails />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:chatId" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
                <Route path="users/:userId" element={<UserProfile />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}