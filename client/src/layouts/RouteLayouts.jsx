import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthLayout() {
    const { user } = useAuth();
    if (user) {
        return <Navigate to={user.role === 'employee' ? '/employee/dashboard' : '/seeker/dashboard'} replace />;
    }
    return <Outlet />;
}

export function ProtectedLayout({ requiredRole }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'employee' ? '/employee/dashboard' : '/seeker/dashboard'} replace />;
    }
    return <Outlet />;
}
