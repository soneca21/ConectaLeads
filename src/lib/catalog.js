import { supabase } from '@/lib/supabase';

const FALLBACK_CATEGORIES = [
  { id: 'gadgets', name: 'Gadgets', slug: 'gadgets' },
  { id: 'beauty', name: 'Beleza', slug: 'beauty' },
  { id: 'home', name: 'Casa', slug: 'home' }
];

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data || FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
};

export const upsertCategory = async (payload) => {
  return supabase.from('categories').upsert(payload, { onConflict: 'slug' }).select().single();
};

export const fetchTags = async () => {
  try {
    const { data, error } = await supabase.from('catalog_tags').select('*').order('name');
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
};

export const upsertTag = async (payload) => {
  return supabase.from('catalog_tags').upsert(payload, { onConflict: 'slug' }).select().single();
};

export const fetchPriceHistory = async (offerId) => {
  try {
    const { data } = await supabase
      .from('price_history')
      .select('price,currency,recorded_at')
      .eq('offer_id', offerId)
      .order('recorded_at', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
};

export const fetchReviews = async (offerId) => {
  try {
    const { data } = await supabase
      .from('offer_reviews')
      .select('author,rating,comment,created_at')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
};

export const fetchFaqs = async (offerId) => {
  try {
    const { data } = await supabase
      .from('offer_faqs')
      .select('question,answer')
      .eq('offer_id', offerId)
      .order('position', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
};

