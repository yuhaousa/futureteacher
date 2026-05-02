import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

function AdminOrHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/home'} replace />;
}
import Layout from './components/Layout';
import AdminLayout from './pages/admin/AdminLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import Home from './pages/Home';
import Discover from './pages/Discover';
import CourseDetail from './pages/CourseDetail';
import MyLearning from './pages/MyLearning';
import Pathways from './pages/Pathways';
import Communities from './pages/Communities';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPathways from './pages/admin/AdminPathways';
import AdminCommunities from './pages/admin/AdminCommunities';
import AdminCourseware from './pages/admin/AdminCourseware';
import AdminJobRoles from './pages/admin/AdminJobRoles';
import AdminSkillFrameworks from './pages/admin/AdminSkillFrameworks';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup" element={<Setup />} />

          {/* Front-end (authenticated) */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/pathways" element={<Pathways />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin back-end */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pathways" element={<AdminPathways />} />
            <Route path="communities" element={<AdminCommunities />} />
            <Route path="courseware/:courseId" element={<AdminCourseware />} />
            <Route path="job-roles" element={<AdminJobRoles />} />
            <Route path="skill-frameworks" element={<AdminSkillFrameworks />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<AdminOrHomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
