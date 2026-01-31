
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
// Admin credentials defined in .env (used only for the first run)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  // ---------------------------------------------------------------------
  // Ensure there is at least one admin user in the `public.users` table.
  // If none exists, we create one using the credentials from the .env file.
  // This runs once on component mount.
  // ---------------------------------------------------------------------
  const ensureAdminUser = useCallback(async () => {
    // 1. Check if any admin already exists
    const { data: existingAdmins, error: adminErr } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    if (adminErr) {
      console.error('Error checking admin users', adminErr);
      return;
    }
    if (existingAdmins && existingAdmins.length > 0) return; // admin already present

    // 2. No admin – create one via Supabase Auth (if not already signed up)
    //    Use the env credentials. If the user already exists in auth, signIn instead.
    let authUser = null;
    // Try to sign in first – if credentials are valid the user already exists.
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (signInData && signInData.user) {
      authUser = signInData.user;
    } else {
      // If sign‑in failed, attempt sign‑up (this will also create the auth user)
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      if (signUpErr) {
        console.error('Failed to create admin user', signUpErr);
        return;
      }
      authUser = signUpData?.user;
    }

    if (!authUser) return;

    // 3. Insert into the public.users table with role admin (ignore if already exists)
    await supabase.from('users').upsert({
      id: authUser.id,
      email: ADMIN_EMAIL,
      role: 'admin',
    }, { onConflict: 'id' });
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    // Run admin creation check once on mount
    ensureAdminUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
