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

import AdminDashboard from './pages/AdminDashboard';
import ReviewQueue from './pages/admin/ReviewQueue';
import ApplicationReview from './pages/admin/ApplicationReview';

import ProtectedRoute from './components/ProtectedRoute';

// Placeholder superadmin dashboard — replace when building Superadmin module
const SuperAdminDashboard = () => <div className="p-8 font-serif text-xl">Super Admin Dashboard Placeholder</div>;

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

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Navigate to="/admin/review-queue" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/review-queue" replace />} />
            <Route path="review-queue" element={<ReviewQueue />} />
            <Route path="review-queue/:id" element={<ApplicationReview />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Super Admin Dashboard Route */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
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
