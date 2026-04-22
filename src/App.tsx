import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageCoursesPage from './pages/ManageCoursesPage';
import DatabaseBackupPage from './pages/DatabaseBackupPage';
import SystemLogsPage from './pages/SystemLogsPage';
import ReportsPage from './pages/ReportsPage';
import LecturerDashboard from './pages/LecturerDashboard';
import LecturerCoursesPage from './pages/LecturerCoursesPage';
import LecturerAssignmentsPage from './pages/LecturerAssignmentsPage';
import LecturerGradingPage from './pages/LecturerGradingPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentGradesPage from './pages/StudentGradesPage';
import StudentCoursesPage from './pages/StudentCoursesPage';
import SubmitAssignmentPage from './pages/SubmitAssignmentPage';
import UploadHistoryPage from './pages/UploadHistoryPage';
import UserManagementPage from './pages/UserManagementPage';
import StudentProfilePage from './pages/StudentProfilePage';
import LecturerGradingFeed from './pages/LecturerGradingFeed';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        <Route path="/reports" element={<DashboardLayout title="Reports" breadcrumb="Report students or teachers"><ReportsPage /></DashboardLayout>} />
        <Route path="/users" element={<DashboardLayout><UserManagementPage /></DashboardLayout>} />
        <Route path="/courses" element={<DashboardLayout><ManageCoursesPage /></DashboardLayout>} />
        <Route path="/backup" element={<DashboardLayout><DatabaseBackupPage /></DashboardLayout>} />
        <Route path="/logs" element={<DashboardLayout><SystemLogsPage /></DashboardLayout>} />
        
        {/* Lecturer Routes */}
        <Route path="/lecturer-dashboard" element={<DashboardLayout><LecturerDashboard /></DashboardLayout>} />
        <Route path="/lecturer-courses" element={<DashboardLayout><LecturerCoursesPage /></DashboardLayout>} />
        <Route path="/lecturer-assignments" element={<DashboardLayout><LecturerAssignmentsPage /></DashboardLayout>} />
        <Route path="/lecturer-grading" element={<DashboardLayout title="Grading Feed" breadcrumb="Review all student submissions"><LecturerGradingFeed /></DashboardLayout>} />
        <Route path="/lecturer-grading/:submissionId" element={<DashboardLayout title="Grading Detail"><LecturerGradingPage /></DashboardLayout>} />
        
        {/* Student Routes */}
        <Route path="/student-dashboard" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
        <Route path="/student-courses" element={<DashboardLayout><StudentCoursesPage /></DashboardLayout>} />
        <Route path="/student-assignments" element={<DashboardLayout title="My Assignments"><StudentAssignmentsPage /></DashboardLayout>} />
        <Route path="/student-profile" element={<DashboardLayout><StudentProfilePage /></DashboardLayout>} />
        <Route path="/assignments/:assignmentId" element={<DashboardLayout title="Submit Assignment"><SubmitAssignmentPage /></DashboardLayout>} />
        <Route path="/upload-history" element={<DashboardLayout><UploadHistoryPage /></DashboardLayout>} />
        <Route path="/student-grades" element={<DashboardLayout><StudentGradesPage /></DashboardLayout>} />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
