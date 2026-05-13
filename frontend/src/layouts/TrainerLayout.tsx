import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import TrainerSidebar from '../components/layout/TrainerSidebar';

export default function TrainerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <TrainerSidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-64px)]"><Outlet /></main>
      </div>
    </div>
  );
}