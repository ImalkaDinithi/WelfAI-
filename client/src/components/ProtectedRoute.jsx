import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    let fallbackPath = '/dashboard';
    if (user.role === 'superadmin') {
      fallbackPath = '/superadmin/dashboard';
    } else if (user.role === 'admin') {
      fallbackPath = '/admin/dashboard';
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
