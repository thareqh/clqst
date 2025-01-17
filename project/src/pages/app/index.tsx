import { Routes, Route, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/Projects/pages/CreateProject';
import { ProjectDetails } from './pages/Projects/pages/ProjectDetails';
import { Chat } from './pages/Chat';
import Explore from './pages/Explore';
import { Profile } from './pages/Profile';
import { UserProfile } from './pages/UserProfile';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex pt-16">
        <AppSidebar />
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pl-72 lg:pb-8 overflow-hidden">
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
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}