import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CombinedLogin from './pages/CombinedLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import VerificationPage from './pages/VerificationPage';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Route - Combined Login */}
          <Route path="/" element={<CombinedLogin />} />
          <Route path="/verify/:registerNumber" element={<VerificationPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student-dashboard"
            element={
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            }
          />

          {/* Redirects/Fallbacks */}
          <Route path="/student-login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
