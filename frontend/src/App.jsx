import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import MockInterview from './pages/student/MockInterview';
import AptitudePractice from './pages/student/AptitudePractice';
import CompanyPrep from './pages/student/CompanyPrep';
import CompanyDetail from './pages/student/CompanyDetail';
import CertificateManager from './pages/student/CertificateManager';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageQuestions from './pages/admin/ManageQuestions';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="/aptitude" element={<AptitudePractice />} />
        <Route path="/companies" element={<CompanyPrep />} />
        <Route path="/companies/:companyId" element={<CompanyDetail />} />
        <Route path="/certificates" element={<CertificateManager />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="questions" element={<ManageQuestions />} />
      </Route>

      {/* Root Redirect */}
      <Route path="/" element={
        <Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'} replace />
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
          toastStyle={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </Router>
    </AuthProvider>
  );
}
