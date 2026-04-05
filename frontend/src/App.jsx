import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CombinedLogin from './pages/CombinedLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import VerificationPage from './pages/VerificationPage';
import { ToastProvider } from './components/Toast';

import { useEffect } from 'react';

const CatchAllRedirect = () => {
  const href = window.location.href;
  useEffect(() => {
    window.location.href = '/';
  }, [href]);
  return null;
};

// Global interceptor for malformed QR code links (like hash routes)
const RouteInterceptor = ({ children }) => {
  useEffect(() => {
    const href = window.location.href;
    if (href.includes('/verify/')) {
      const match = href.match(/\/verify\/([A-Za-z0-9]+)/i);
      // Check if we are not already exactly on the correct path
      if (match && match[1] && window.location.pathname !== `/verify/${match[1]}`) {
        window.location.href = `/verify/${match[1]}`;
      }
    }
  }, []);
  return children;
};

function App() {
  return (
    <ToastProvider>
      <RouteInterceptor>
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
          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </Router>
      </RouteInterceptor>
    </ToastProvider>
  );
}

export default App;
