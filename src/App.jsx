
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

// Layouts
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';

// Pages
import Home from '@/pages/Home';
import OfferDetail from '@/pages/OfferDetail';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLeads from '@/pages/AdminLeads';
import AdminLeadDetail from '@/pages/AdminLeadDetail';
import AdminPipeline from '@/pages/AdminPipeline';
import AdminInbox from '@/pages/AdminInbox';
import AdminOffers from '@/pages/AdminOffers';
import AdminOfferForm from '@/pages/AdminOfferForm';
import AdminCatalog from '@/pages/AdminCatalog';

import AdminSettings from '@/pages/AdminSettings';
import AdminPrompts from '@/pages/AdminPrompts';
import ShopeeCallback from '@/pages/ShopeeCallback';
import AdminLeadForm from '@/pages/AdminLeadForm';
import CategoryPage from '@/pages/CategoryPage';
import Collections from '@/pages/Collections';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfile(user);

  if (loading || loadingProfile) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile || (profile.role !== 'admin' && window.location.pathname.includes('settings'))) {
    return <div className="p-8 text-center text-red-500">Acesso restrito. Apenas administradores podem acessar esta área.</div>;
  }
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col md:pl-[80px] lg:pl-[250px] transition-all duration-300">
        <Topbar />
        <main className="flex-1 overflow-auto bg-[var(--bg-primary)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/o/:slug" element={<OfferDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/collections" element={<Collections />} />
          
          {/* Shopee OAuth Callback - Needs to be public/accessible */}
          <Route path="/api/shopee/auth/callback" element={<ShopeeCallback />} />

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            <Route path="leads" element={<AdminLeads />} />
            <Route path="leads/new" element={<AdminLeadForm />} />
            <Route path="leads/:id/edit" element={<AdminLeadForm />} />
            <Route path="leads/:id" element={<AdminLeadDetail />} />
            
            <Route path="pipeline" element={<AdminPipeline />} />
            <Route path="inbox" element={<AdminInbox />} />
            
            <Route path="offers" element={<AdminOffers />} />
            <Route path="offers/new" element={<AdminOfferForm />} />
            <Route path="offers/:id" element={<AdminOfferForm />} />
            <Route path="catalog" element={<AdminCatalog />} />
            
            <Route path="prompts" element={<AdminPrompts />} />
            
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
