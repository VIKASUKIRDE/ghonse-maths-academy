import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';
import ParentDashboard from './parent/ParentDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.Admin:
        return <AdminDashboard />;
      case UserRole.Teacher:
        return <TeacherDashboard />;
      case UserRole.Student:
        return <StudentDashboard />;
      case UserRole.Parent:
        return <ParentDashboard />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome, {user.name}!</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Here's a summary of the academy's activities.</p>
        {renderDashboard()}
    </div>
  );
};

export default DashboardPage;