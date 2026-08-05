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
import ContractsListPage from '@/pages/app/contracts/ContractsListPage';
import ContractDetailPage from '@/pages/app/contracts/ContractDetailPage';
import WalletPage from '@/pages/app/payments/WalletPage';
import ChatPage from '@/pages/app/chat/ChatPage';
import NotificationsPage from '@/pages/app/notifications/NotificationsPage';
import AdminDashboardPage from '@/pages/app/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/app/admin/AdminUsersPage';
import AdminApprovalsPage from '@/pages/app/admin/AdminApprovalsPage';
import AdminModerationPage from '@/pages/app/admin/AdminModerationPage';
import AdminReportsPage from '@/pages/app/admin/AdminReportsPage';
import AdminDisputesPage from '@/pages/app/admin/AdminDisputesPage';
import AdminCategoriesPage from '@/pages/app/admin/AdminCategoriesPage';
import AdminAnalyticsPage from '@/pages/app/admin/AdminAnalyticsPage';
import AdminConfigPage from '@/pages/app/admin/AdminConfigPage';
import AdminTeamPage from '@/pages/app/admin/AdminTeamPage';
import AiRecruiterPage from '@/pages/app/ai/AiRecruiterPage';
import DisputesListPage from '@/pages/app/disputes/DisputesListPage';
import DisputeDetailPage from '@/pages/app/disputes/DisputeDetailPage';
import CategoriesPage from '@/pages/app/categories/CategoriesPage';
import SupportPage from '@/pages/app/support/SupportPage';
import BrowseTalentPage from '@/pages/app/talent/BrowseTalentPage';

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
          { path: 'ai-recruiter', element: <AiRecruiterPage /> },
          { path: 'contracts', element: <ContractsListPage /> },
          { path: 'contracts/:id', element: <ContractDetailPage /> },
          { path: 'messages', element: <ChatPage /> },
          { path: 'messages/:id', element: <ChatPage /> },
          { path: 'payments', element: <WalletPage /> },
          { path: 'catalogs', element: <CatalogsPage /> },
          { path: 'catalogs/new', element: <CatalogFormPage /> },
          { path: 'catalogs/:id', element: <CatalogDetailPage /> },
          { path: 'catalogs/:id/edit', element: <CatalogFormPage /> },
          { path: 'saved', element: <SavedItemsPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'support', element: <SupportPage /> },
          { path: 'browse-talent', element: <BrowseTalentPage /> },
          { path: 'disputes', element: <DisputesListPage /> },
          { path: 'disputes/:id', element: <DisputeDetailPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'onboarding', element: <OnboardingPage /> },
          {
            path: 'admin',
            element: <RoleRoute allow={['SUPER_ADMIN']} />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'approvals', element: <AdminApprovalsPage /> },
              { path: 'moderation', element: <AdminModerationPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: 'disputes', element: <AdminDisputesPage /> },
              { path: 'categories', element: <AdminCategoriesPage /> },
              { path: 'analytics', element: <AdminAnalyticsPage /> },
              { path: 'config', element: <AdminConfigPage /> },
              { path: 'team', element: <AdminTeamPage /> },
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
