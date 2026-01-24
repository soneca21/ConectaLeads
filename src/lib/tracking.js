
import { supabase } from '@/lib/customSupabaseClient';

const getSessionId = () => {
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('session_id', sid);
  }
  return sid;
};

const getUtmParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
  };
};

export const trackEvent = async (type, data = {}) => {
  const sessionId = getSessionId();
  const utmParams = getUtmParams();
  
  // Remover 'page' dos dados se existir para evitar erros de esquema,
  // pois a tabela de eventos usa 'path'.
  const { page, ...eventData } = data;
  
  const payload = {
    type,
    session_id: sessionId,
    referrer: document.referrer,
    path: window.location.pathname,
    ...utmParams,
    ...eventData,
    created_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('events').insert([payload]);
    if (error) {
      console.error('Erro de Rastreamento:', error);
    }
  } catch (err) {
    console.error('Exceção de Rastreamento:', err);
  }
};
