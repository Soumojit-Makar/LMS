import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import StudentSidebar from '../components/layout/StudentSidebar';

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <StudentSidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-64px)]"><Outlet /></main>
      </div>
    </div>
  );
}