/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RescueBanner } from './components/RescueBanner';
import { DemoController } from './components/DemoController';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ChatAssistant } from './components/ChatAssistant';
import { UserRole } from './types';

// Pages
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FoodListingsPage } from './pages/FoodListingsPage';
import { MapPage } from './pages/MapPage';
import { ImpactPage } from './pages/ImpactPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProfilePage } from './pages/ProfilePage';
import {
  LoginPage,
  RegisterPage,
  NgoRegisterPage,
  VolunteerRegisterPage
} from './pages/AuthPages';
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage';
import { DonateFoodPage } from './pages/donor/DonateFoodPage';
import { NgoDashboardPage } from './pages/ngo/NgoDashboardPage';
import { VolunteerDashboardPage } from './pages/volunteer/VolunteerDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

/**
 * Route protection guard ensuring users cannot access private dashboards
 * without proper authentication or correct role credentials.
 */
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectRole?: UserRole;
}> = ({ children, allowedRoles, redirectRole }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to={`/login${redirectRole ? `?role=${redirectRole}` : ''}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'DONOR') return <Navigate to="/donor/dashboard" replace />;
    if (currentUser.role === 'NGO') return <Navigate to="/ngo/dashboard" replace />;
    if (currentUser.role === 'VOLUNTEER') return <Navigate to="/volunteer/dashboard" replace />;
    if (currentUser.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Role-aware dashboard dispatcher for generic "/dashboard" navigation
 */
const DashboardDispatcher: React.FC = () => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'DONOR') return <DonorDashboardPage />;
  if (currentUser.role === 'NGO') return <NgoDashboardPage />;
  if (currentUser.role === 'VOLUNTEER') return <VolunteerDashboardPage />;
  if (currentUser.role === 'ADMIN') return <AdminDashboardPage />;
  return <Navigate to="/" replace />;
};

/**
 * Role-aware matches dispatcher for "/matches" navigation
 */
const MatchesDispatcher: React.FC = () => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'DONOR') return <DonorDashboardPage />;
  if (currentUser.role === 'NGO') return <NgoDashboardPage initialTab="AVAILABLE" />;
  if (currentUser.role === 'VOLUNTEER') return <VolunteerDashboardPage />;
  if (currentUser.role === 'ADMIN') return <AdminDashboardPage initialTab="MISSIONS" />;
  return <Navigate to="/" replace />;
};

const AppLayout: React.FC = () => {
  const { authLoading, currentUser } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 animate-pulse">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
              ShareBite
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Initializing platform...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mt-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* 1. Critical Food Rescue Mode Banner */}
      <RescueBanner />

      {/* 2. Global Navigation Header */}
      <Header onOpenNotifications={() => setNotificationsOpen(true)} />

      {/* 3. Main Dynamic Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Public Landing & Informational Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/listings" element={<FoodListingsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication Entry Points */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/donor" element={<LoginPage defaultRole="DONOR" />} />
          <Route path="/login/ngo" element={<LoginPage defaultRole="NGO" />} />
          <Route path="/login/collector" element={<LoginPage defaultRole="VOLUNTEER" />} />
          <Route path="/ngo-login" element={<LoginPage defaultRole="NGO" />} />

          {/* Registration Entry Points */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/donor" element={<RegisterPage />} />
          <Route path="/register/ngo" element={<NgoRegisterPage />} />
          <Route path="/register/collector" element={<VolunteerRegisterPage />} />
          <Route path="/donor-register" element={<RegisterPage />} />
          <Route path="/ngo-register" element={<NgoRegisterPage />} />
          <Route path="/volunteer-register" element={<VolunteerRegisterPage />} />

          {/* Authenticated Dispatchers */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardDispatcher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchesDispatcher />
              </ProtectedRoute>
            }
          />

          {/* User Profile & Location Settings */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Donor Routes */}
          <Route
            path="/donate"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} redirectRole="DONOR">
                <DonateFoodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/donate"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} redirectRole="DONOR">
                <DonateFoodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} redirectRole="DONOR">
                <DonorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-donations"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} redirectRole="DONOR">
                <DonorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} redirectRole="DONOR">
                <DonorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/donations"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} redirectRole="DONOR">
                <DonorDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* NGO Routes */}
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']} redirectRole="NGO">
                <NgoDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-listings"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']} redirectRole="NGO">
                <FoodListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickups"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']} redirectRole="NGO">
                <NgoDashboardPage initialTab="INCOMING" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickup-requests"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']} redirectRole="NGO">
                <NgoDashboardPage initialTab="INCOMING" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/pickups"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']} redirectRole="NGO">
                <NgoDashboardPage initialTab="INCOMING" />
              </ProtectedRoute>
            }
          />

          {/* Collector / Volunteer Routes */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']} redirectRole="VOLUNTEER">
                <VolunteerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/available-pickups"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']} redirectRole="VOLUNTEER">
                <FoodListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']} redirectRole="VOLUNTEER">
                <VolunteerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-missions"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']} redirectRole="VOLUNTEER">
                <VolunteerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/missions"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']} redirectRole="VOLUNTEER">
                <VolunteerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} redirectRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} redirectRole="ADMIN">
                <AdminDashboardPage initialTab="NGOS" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} redirectRole="ADMIN">
                <AdminDashboardPage initialTab="DONATIONS" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/missions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} redirectRole="ADMIN">
                <AdminDashboardPage initialTab="MISSIONS" />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 4. Global Footer */}
      <Footer />

      {/* 5. Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* 6. AI Assistant Chat Widget */}
      <ChatAssistant />

      {/* 7. Interactive Hackathon Demo Controller Dock (Only visible after login) */}
      {currentUser && <DemoController />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </AppProvider>
    </BrowserRouter>
  );
}
