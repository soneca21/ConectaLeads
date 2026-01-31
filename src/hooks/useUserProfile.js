import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Query the profile using the Supabase auth user ID instead of email.
    // The `users` table stores the auth user UUID in the `id` column, which
    // guarantees a unique match. Using email can fail when the email field is
    // not populated or differs in case.
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user]);

  return { profile, loading };
}
