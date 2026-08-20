import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicationForm from './pages/ApplicationForm';
import ApplicantDashboard from './pages/ApplicantDashboard';

import DashboardHome from './pages/applicant/DashboardHome';
import MyApplicationPage from './pages/applicant/MyApplicationPage';
import ProfilePage from './pages/applicant/ProfilePage';
import FraudResultPage from './pages/applicant/FraudResultPage';
import RecommendationsPage from './pages/applicant/RecommendationsPage';

import ProtectedRoute from './components/ProtectedRoute';

// Placeholder admin dashboard — replace when building Admin module
const AdminDashboard = () => <div className="p-8 font-serif text-xl">Admin Dashboard Placeholder</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Nested Applicant Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <ApplicantDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="application" element={<MyApplicationPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="fraud-result" element={<FraudResultPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
          </Route>

          {/* Application Form Wizard Route */}
          <Route
            path="/application/new"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <ApplicationForm />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
