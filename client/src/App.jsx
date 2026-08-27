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
import AppealForm from './pages/applicant/AppealForm';
import LifestylePlanStatus from './pages/applicant/LifestylePlanStatus';

import AdminDashboard from './pages/AdminDashboard';
import ReviewQueue from './pages/admin/ReviewQueue';
import ApplicationReview from './pages/admin/ApplicationReview';
import AppealQueue from './pages/admin/AppealQueue';
import AppealReview from './pages/admin/AppealReview';
import ApplicationsOverview from './pages/admin/ApplicationsOverview';
import LifestylePlanQueue from './pages/admin/LifestylePlanQueue';
import LifestylePlanReview from './pages/admin/LifestylePlanReview';
import LifestylePlanForm from './pages/applicant/LifestylePlanForm';
import PlanEvidenceUpload from './pages/applicant/PlanEvidenceUpload';
import PlanProgressReview from './pages/admin/PlanProgressReview';
import WaitingListQueue from './pages/admin/WaitingListQueue';
import WaitingListReview from './pages/admin/WaitingListReview';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="lifestyle-plan" element={<LifestylePlanStatus />} />
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

          {/* Appeal Form Route */}
          <Route
            path="/appeal"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <AppealForm />
              </ProtectedRoute>
            }
          />

          {/* Lifestyle Plan Form Route */}
          <Route
            path="/lifestyle-plan"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <LifestylePlanForm />
              </ProtectedRoute>
            }
          />

          {/* Lifestyle Plan Evidence Route */}
          <Route
            path="/lifestyle-plan/evidence"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <PlanEvidenceUpload />
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
            <Route path="appeal-queue" element={<AppealQueue />} />
            <Route path="appeal-queue/:id" element={<AppealReview />} />
            <Route path="lifestyle-plan-queue" element={<LifestylePlanQueue />} />
            <Route path="lifestyle-plan-queue/:id" element={<LifestylePlanReview />} />
            <Route path="lifestyle-plan-queue/:id/progress" element={<PlanProgressReview />} />
            <Route path="applications" element={<ApplicationsOverview />} />
            <Route path="waiting-list-queue" element={<WaitingListQueue />} />
            <Route path="waiting-list-queue/:id" element={<WaitingListReview />} />
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
