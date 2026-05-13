import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import PublicLayout   from '../layouts/PublicLayout';
import StudentLayout  from '../layouts/StudentLayout';
import TrainerLayout  from '../layouts/TrainerLayout';
import AdminLayout    from '../layouts/AdminLayout';

import HomePage           from '../pages/public/HomePage';
import CourseBrowserPage  from '../pages/public/CourseBrowserPage';
import CourseDetailPage   from '../pages/public/CourseDetailPage';
import NotFoundPage       from '../pages/public/NotFoundPage';
import LoginPage          from '../pages/auth/LoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';

import StudentDashboard   from '../pages/student/DashboardPage';
import LessonPlayerPage   from '../pages/student/LessonPlayerPage';
import QuizPage           from '../pages/student/QuizPage';
import CertificatePage    from '../pages/student/CertificatePage';
import ProfilePage        from '../pages/student/ProfilePage';

import TrainerDashboard   from '../pages/trainer/TrainerDashboardPage';
import CourseBuilderPage  from '../pages/trainer/CourseBuilderPage';
import CourseEditPage     from '../pages/trainer/CourseEditPage';
import StudentRosterPage  from '../pages/trainer/StudentRosterPage';
import TrainerAnalyticsPage from '../pages/trainer/AnalyticsPage';

import AdminDashboard       from '../pages/admin/AdminDashboardPage';
import UserManagementPage   from '../pages/admin/UserManagementPage';
import CourseModerationPage from '../pages/admin/CoursesModerationPage';
import CategoryPage         from '../pages/admin/CategoryPage';
import TrainerApprovalPage  from '../pages/admin/TrainerApprovalPage';
import PaymentMonitorPage   from '../pages/admin/PaymentMonitorPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      // { path: '/',              element: <HomePage /> },
      { path: '/courses',       element: <CourseBrowserPage /> },
      { path: '/courses/:slug', element: <CourseDetailPage /> },
      { path: '/',         element: <LoginPage /> },
      { path: '/register',      element: <RegisterPage /> },
      { path: '*',              element: <NotFoundPage /> },
    ],
  },
  {
    element: <ProtectedRoute><StudentLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard',                         element: <RoleRoute roles={['student']}><StudentDashboard /></RoleRoute> },
      { path: '/learn/:courseId/lessons/:lessonId', element: <RoleRoute roles={['student']}><LessonPlayerPage /></RoleRoute> },
      { path: '/learn/:courseId/quiz',              element: <RoleRoute roles={['student']}><QuizPage /></RoleRoute> },
      { path: '/certificate/:courseId',             element: <RoleRoute roles={['student']}><CertificatePage /></RoleRoute> },
      { path: '/profile',                           element: <ProfilePage /> },
    ],
  },
  {
    element: <ProtectedRoute><TrainerLayout /></ProtectedRoute>,
    children: [
      { path: '/trainer',                      element: <RoleRoute roles={['trainer']}><TrainerDashboard /></RoleRoute> },
      { path: '/trainer/courses/new',          element: <RoleRoute roles={['trainer']}><CourseBuilderPage /></RoleRoute> },
      { path: '/trainer/courses/:id/:slug/edit',     element: <RoleRoute roles={['trainer']}><CourseEditPage /></RoleRoute> },
      { path: '/trainer/courses/:id/students', element: <RoleRoute roles={['trainer']}><StudentRosterPage /></RoleRoute> },
      { path: '/trainer/analytics',            element: <RoleRoute roles={['trainer']}><TrainerAnalyticsPage /></RoleRoute> },
    ],
  },
  {
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { path: '/admin',             element: <RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute> },
      { path: '/admin/users',       element: <RoleRoute roles={['admin']}><UserManagementPage /></RoleRoute> },
      { path: '/admin/courses',     element: <RoleRoute roles={['admin']}><CourseModerationPage /></RoleRoute> },
      { path: '/admin/categories',  element: <RoleRoute roles={['admin']}><CategoryPage /></RoleRoute> },
      { path: '/admin/trainers',    element: <RoleRoute roles={['admin']}><TrainerApprovalPage /></RoleRoute> },
      { path: '/admin/payments',    element: <RoleRoute roles={['admin']}><PaymentMonitorPage /></RoleRoute> },
    ],
  },
]);
