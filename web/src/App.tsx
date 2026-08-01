import { useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { fetchMe } from '@/features/auth/actions';
import GlobalSnackbar from '@/components/GlobalSnackbar';
import ErrorPage from '@/pages/ErrorPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LandingPage from '@/pages/landing/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import CheckEmailPage from '@/pages/auth/CheckEmailPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import DashboardPage from '@/pages/app/DashboardPage';
import ComingSoonPage from '@/pages/ComingSoonPage';
import OnboardingPage from '@/pages/app/onboarding/OnboardingPage';
import ProfilePage from '@/pages/app/profile/ProfilePage';
import MyJobsPage from '@/pages/app/jobs/MyJobsPage';
import BrowseJobsPage from '@/pages/app/jobs/BrowseJobsPage';
import JobDetailPage from '@/pages/app/jobs/JobDetailPage';
import JobFormPage from '@/pages/app/jobs/JobFormPage';
import ApplicationsPage from '@/pages/app/applications/ApplicationsPage';
import CatalogsPage from '@/pages/app/catalogs/CatalogsPage';
import CatalogDetailPage from '@/pages/app/catalogs/CatalogDetailPage';
import CatalogFormPage from '@/pages/app/catalogs/CatalogFormPage';
import SavedItemsPage from '@/pages/app/saved/SavedItemsPage';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <ErrorPage /> },
  { path: '/login', element: <LoginPage />, errorElement: <ErrorPage /> },
  { path: '/signup', element: <SignupPage />, errorElement: <ErrorPage /> },
  { path: '/check-email', element: <CheckEmailPage />, errorElement: <ErrorPage /> },
  { path: '/verify-email', element: <VerifyEmailPage />, errorElement: <ErrorPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage />, errorElement: <ErrorPage /> },
  { path: '/reset-password', element: <ResetPasswordPage />, errorElement: <ErrorPage /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'jobs', element: <MyJobsPage /> },
          { path: 'jobs/new', element: <JobFormPage /> },
          { path: 'jobs/:id', element: <JobDetailPage /> },
          { path: 'jobs/:id/edit', element: <JobFormPage /> },
          { path: 'browse', element: <BrowseJobsPage /> },
          { path: 'applications', element: <ApplicationsPage /> },
          { path: 'applications/:id', element: <ComingSoonPage title="Application" /> },
          { path: 'ai-recruiter', element: <ComingSoonPage title="AI Recruiter" /> },
          { path: 'contracts', element: <ComingSoonPage title="Contracts" /> },
          { path: 'contracts/:id', element: <ComingSoonPage title="Contract" /> },
          { path: 'messages', element: <ComingSoonPage title="Messages" /> },
          { path: 'messages/:id', element: <ComingSoonPage title="Conversation" /> },
          { path: 'payments', element: <ComingSoonPage title="Payments" /> },
          { path: 'catalogs', element: <CatalogsPage /> },
          { path: 'catalogs/new', element: <CatalogFormPage /> },
          { path: 'catalogs/:id', element: <CatalogDetailPage /> },
          { path: 'catalogs/:id/edit', element: <CatalogFormPage /> },
          { path: 'saved', element: <SavedItemsPage /> },
          { path: 'disputes', element: <ComingSoonPage title="Disputes" /> },
          { path: 'disputes/:id', element: <ComingSoonPage title="Dispute" /> },
          { path: 'notifications', element: <ComingSoonPage title="Notifications" /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'onboarding', element: <OnboardingPage /> },
          {
            path: 'admin',
            element: <RoleRoute allow={['SUPER_ADMIN']} />,
            children: [
              { index: true, element: <ComingSoonPage title="Admin dashboard" /> },
              { path: 'users', element: <ComingSoonPage title="Users" /> },
              { path: 'approvals', element: <ComingSoonPage title="Approvals queue" /> },
              { path: 'moderation', element: <ComingSoonPage title="Moderation" /> },
              { path: 'reports', element: <ComingSoonPage title="Reports" /> },
              { path: 'disputes', element: <ComingSoonPage title="Disputes" /> },
              { path: 'categories', element: <ComingSoonPage title="Categories" /> },
              { path: 'analytics', element: <ComingSoonPage title="Analytics" /> },
              { path: 'config', element: <ComingSoonPage title="Commission & config" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <GlobalSnackbar />
    </>
  );
}
