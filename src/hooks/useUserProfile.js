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
    supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user]);

  return { profile, loading };
}
