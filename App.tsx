import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminStudentManagement from './pages/admin/AdminStudentManagement';
import AdminTeacherManagement from './pages/admin/AdminTeacherManagement';
import AdminBatchManagement from './pages/admin/AdminBatchManagement';
import { AdminReports } from './pages/admin/AdminReports';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import { UserRole } from './types';
import MainLayout from './components/MainLayout';
import AdminExams from './pages/admin/AdminExams';
import AdminFees from './pages/admin/AdminFees';
import TeacherExamManagement from './pages/teacher/TeacherExamManagement';
import StudentReportCard from './pages/student/StudentReportCard';
import StudentExamDates from './pages/student/StudentExamDates';
import StudentAttendance from './pages/student/StudentAttendance';
import ParentChildInfo from './pages/parent/ParentChildInfo';
import ParentReportCard from './pages/parent/ParentReportCard';
import ParentAttendance from './pages/parent/ParentAttendance';
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import AdminSmsManagement from './pages/admin/AdminSmsManagement';
import BatchSelectionPage from './pages/BatchSelectionPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminStarPerformerManagement from './pages/admin/AdminStarPerformerManagement';
import FeeReceiptPage from './pages/admin/FeeReceiptPage';
import TeacherProgressReport from './pages/teacher/TeacherProgressReport';

const ProtectedRoute: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div>Loading...</div></div>;
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


const ProtectedPagesLayout: React.FC = () => {
    return (
        <ProtectedRoute roles={[UserRole.Admin, UserRole.Teacher, UserRole.Student, UserRole.Parent]}>
            <MainLayout>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Admin Routes - These are individually protected to ensure only admins can access them */}
                    <Route path="/students" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminStudentManagement /></ProtectedRoute>} />
                    <Route path="/teachers" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminTeacherManagement /></ProtectedRoute>} />
                    <Route path="/batches" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminBatchManagement /></ProtectedRoute>} />
                    <Route path="/exams" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminExams /></ProtectedRoute>} />
                    <Route path="/fees" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminFees /></ProtectedRoute>} />
                    <Route path="/fees/receipt/:studentId" element={<ProtectedRoute roles={[UserRole.Admin]}><FeeReceiptPage /></ProtectedRoute>} />
                    <Route path="/star-performers" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminStarPerformerManagement /></ProtectedRoute>} />
                    <Route path="/sms" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminSmsManagement /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminReports /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute roles={[UserRole.Admin]}><AdminProfilePage /></ProtectedRoute>} />

                    {/* Teacher Routes */}
                    <Route path="/teacher/students" element={<ProtectedRoute roles={[UserRole.Teacher]}><TeacherDashboard /></ProtectedRoute>} />
                    <Route path="/teacher/exams" element={<ProtectedRoute roles={[UserRole.Teacher]}><TeacherExamManagement /></ProtectedRoute>} />
                    <Route path="/teacher/progress-report" element={<ProtectedRoute roles={[UserRole.Teacher]}><TeacherProgressReport /></ProtectedRoute>} />

                    {/* Student Routes */}
                    <Route path="/student/report-card" element={<ProtectedRoute roles={[UserRole.Student, UserRole.Parent]}><StudentReportCard /></ProtectedRoute>} />
                    <Route path="/student/exam-dates" element={<ProtectedRoute roles={[UserRole.Student]}><StudentExamDates /></ProtectedRoute>} />
                    <Route path="/student/attendance" element={<ProtectedRoute roles={[UserRole.Student, UserRole.Parent]}><StudentAttendance /></ProtectedRoute>} />
                    
                    {/* Parent Routes */}
                    <Route path="/parent/child-info" element={<ProtectedRoute roles={[UserRole.Parent]}><ParentChildInfo /></ProtectedRoute>} />
                    <Route path="/parent/report-card" element={<ProtectedRoute roles={[UserRole.Parent]}><ParentReportCard /></ProtectedRoute>} />
                    <Route path="/parent/attendance" element={<ProtectedRoute roles={[UserRole.Parent]}><ParentAttendance /></ProtectedRoute>} />
                    
                    {/* Redirect any other authenticated route to dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </MainLayout>
        </ProtectedRoute>
    );
}


const AppRoutes: React.FC = () => {
    const { user, tempUser, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div>Loading...</div></div>;
    }

    if (tempUser && !user) {
        // User is authenticated but needs to select a batch.
        return (
            <Routes>
                <Route path="/select-batch" element={<BatchSelectionPage />} />
                <Route path="*" element={<Navigate to="/select-batch" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/select-role" element={!user ? <RoleSelectionPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/*" element={user ? <ProtectedPagesLayout /> : <Navigate to="/login" replace />} />
        </Routes>
    );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;