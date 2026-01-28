import { supabase } from '@/lib/supabase';

export const fetchPipelines = async () => {
  const { data, error } = await supabase.from('pipelines').select('*').order('name');
  if (error) throw error;
  return data || [];
};

export const fetchStages = async (pipelineId) => {
  const query = supabase
    .from('pipeline_stages')
    .select('*')
    .order('order_index', { ascending: true });

  const { data, error } = pipelineId ? await query.eq('pipeline_id', pipelineId) : await query;
  if (error) throw error;
  return data || [];
};

