import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageCoursesPage from './pages/ManageCoursesPage';
import DatabaseBackupPage from './pages/DatabaseBackupPage';
import SystemLogsPage from './pages/SystemLogsPage';
import LecturerDashboard from './pages/LecturerDashboard';
import LecturerCoursesPage from './pages/LecturerCoursesPage';
import LecturerAssignmentsPage from './pages/LecturerAssignmentsPage';
import LecturerGradingPage from './pages/LecturerGradingPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentGradesPage from './pages/StudentGradesPage';
import SubmitAssignmentPage from './pages/SubmitAssignmentPage';
import UploadHistoryPage from './pages/UploadHistoryPage';
import UserManagementPage from './pages/UserManagementPage';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/courses" element={<ManageCoursesPage />} />
        <Route path="/backup" element={<DatabaseBackupPage />} />
        <Route path="/logs" element={<SystemLogsPage />} />
        
        {/* Lecturer Routes */}
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/lecturer-courses" element={<LecturerCoursesPage />} />
        <Route path="/lecturer-assignments" element={<LecturerAssignmentsPage />} />
        <Route path="/lecturer-grading/:submissionId" element={<LecturerGradingPage />} />
        
        {/* Student Routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/assignments/:assignmentId" element={<SubmitAssignmentPage />} />
        <Route path="/upload-history" element={<UploadHistoryPage />} />
        <Route path="/student-grades" element={<StudentGradesPage />} />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
