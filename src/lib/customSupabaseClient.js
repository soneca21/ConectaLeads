import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttnqjbqykcexibxbboax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bnFqYnF5a2NleGlieGJib2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzk2NzUsImV4cCI6MjA4NDg1NTY3NX0.93NLY--qohP5QbYVQkOKUqP0_9mx0tK1hwdMkcCOvN0';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
