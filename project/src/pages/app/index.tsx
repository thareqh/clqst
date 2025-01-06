import { Routes, Route } from 'react-router-dom';
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

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex h-[calc(100vh-4rem)]">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
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
        </main>
      </div>
    </div>
  );
}