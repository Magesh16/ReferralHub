import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthLayout, ProtectedLayout } from './layouts/RouteLayouts';
import { LoadingScreen } from './components/ui/index.jsx';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MyReferrals from './pages/employee/MyReferrals';
import CreateReferral from './pages/employee/CreateReferral';
import EmployeeAppointments from './pages/employee/Appointments';

// Seeker pages
import SeekerDashboard from './pages/seeker/Dashboard';
import BrowseReferrals from './pages/seeker/BrowseReferrals';
import ReferralDetail from './pages/seeker/ReferralDetail';
import BookAppointment from './pages/seeker/BookAppointment';
import MyBookings from './pages/seeker/MyBookings';
import MostMatchedJobs from './pages/seeker/MostMatchedJobs';

function AppShell() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: {
          background: theme === 'dark' ? '#12132A' : '#FFFFFF',
          color: theme === 'dark' ? '#EDEFFF' : '#0D0E1A',
          border: '1px solid',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: { iconTheme: { primary: '#00E676', secondary: 'white' } },
        error: { iconTheme: { primary: '#FF5252', secondary: 'white' } },
      }} />

      <BrowserRouter>
        {user && (
          <>
            <Navbar theme={theme} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} />
          </>
        )}
        <div className={user ? 'page-content' : ''}>
          <Routes>
            {/* ── Auth (redirects to dashboard if already logged in) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* ── Employee */}
            <Route element={<ProtectedLayout requiredRole="employee" />}>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/referrals" element={<MyReferrals />} />
              <Route path="/employee/referrals/new" element={<CreateReferral />} />
              <Route path="/employee/appointments" element={<EmployeeAppointments />} />
            </Route>

            {/* ── Seeker */}
            <Route element={<ProtectedLayout requiredRole="seeker" />}>
              <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
              <Route path="/seeker/browse" element={<BrowseReferrals />} />
              <Route path="/seeker/matched" element={<MostMatchedJobs />} />
              <Route path="/seeker/referrals/:id" element={<ReferralDetail />} />
              <Route path="/seeker/referrals/:id/book" element={<BookAppointment />} />
              <Route path="/seeker/bookings" element={<MyBookings />} />
            </Route>

            {/* ── Shared (both roles) */}
            <Route path="/profile" element={<Profile />} />

            {/* ── Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppShell />
      </NotificationProvider>
    </AuthProvider>
  );
}
