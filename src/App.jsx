
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
import AdminSettings from '@/pages/AdminSettings';
import AdminPrompts from '@/pages/AdminPrompts';
import ShopeeCallback from '@/pages/ShopeeCallback'; // New page

const AdminLayout = () => {
  // Use localStorage for now as simple auth check for admin routes
  // In a real app, use the useAuth hook from AuthProvider
  const isAuthenticated = localStorage.getItem('auth_token'); 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
          
          {/* Shopee OAuth Callback - Needs to be public/accessible */}
          <Route path="/api/shopee/auth/callback" element={<ShopeeCallback />} />

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            <Route path="leads" element={<AdminLeads />} />
            <Route path="leads/:id" element={<AdminLeadDetail />} />
            
            <Route path="pipeline" element={<AdminPipeline />} />
            <Route path="inbox" element={<AdminInbox />} />
            
            <Route path="offers" element={<AdminOffers />} />
            <Route path="offers/new" element={<AdminOfferForm />} />
            <Route path="offers/:id" element={<AdminOfferForm />} />
            
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
