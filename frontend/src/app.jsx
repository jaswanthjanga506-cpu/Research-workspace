import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/authStore';
import DashboardLayout from './layouts/DashboardLayout';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const RegisterPage  = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const NotePage      = lazy(() => import('./pages/NotePage'));
const DocumentPage  = lazy(() => import('./pages/DocumentPage'));
const ProfilePage   = lazy(() => import('./pages/ProfilePage'));
const AdminPage     = lazy(() => import('./pages/AdminPage'));
const NotFoundPage  = lazy(() => import('./pages/NotFoundPage'));

// ── React Query Client ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ── Full-screen loader ───────────────────────────────────────────────────────
function FullLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-10 h-10 rounded-full border-[3px] border-bg-border border-t-primary animate-spin" />
    </div>
  );
}

// ── Page transition wrapper ──────────────────────────────────────────────────
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Public Route (redirect if already logged in) ─────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Animated Routes ──────────────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <PageTransition>
              <Suspense fallback={<FullLoader />}><LoginPage /></Suspense>
            </PageTransition>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <PageTransition>
              <Suspense fallback={<FullLoader />}><RegisterPage /></Suspense>
            </PageTransition>
          </PublicRoute>
        } />

        {/* Protected dashboard layout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={
            <PageTransition><Suspense fallback={<FullLoader />}><DashboardPage /></Suspense></PageTransition>
          } />
          <Route path="/workspaces/:workspaceId" element={
            <PageTransition><Suspense fallback={<FullLoader />}><WorkspacePage /></Suspense></PageTransition>
          } />
          <Route path="/workspaces/:workspaceId/notes/:noteId" element={
            <PageTransition><Suspense fallback={<FullLoader />}><NotePage /></Suspense></PageTransition>
          } />
          <Route path="/workspaces/:workspaceId/documents/:documentId" element={
            <PageTransition><Suspense fallback={<FullLoader />}><DocumentPage /></Suspense></PageTransition>
          } />
          <Route path="/profile" element={
            <PageTransition><Suspense fallback={<FullLoader />}><ProfilePage /></Suspense></PageTransition>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <PageTransition><Suspense fallback={<FullLoader />}><AdminPage /></Suspense></PageTransition>
            </ProtectedRoute>
          } />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={
          <PageTransition><Suspense fallback={<FullLoader />}><NotFoundPage /></Suspense></PageTransition>
        } />

      </Routes>
    </AnimatePresence>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}