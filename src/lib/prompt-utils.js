
import { supabase } from '@/lib/supabase';

export const generateBotToken = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const logAuditAction = async (action, entity, entityId, before, after) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('audit_log').insert({
      actor_user_id: user.id,
      action,
      entity,
      entity_id: entityId,
      before_state: before,
      after_state: after
    });
  } catch (e) {
    console.error("Audit log failed", e);
  }
};

export const createPromptVersion = async (flowId, cloneFromVersionId = null) => {
  try {
    // Get next version number
    const { data: lastVersion } = await supabase
      .from('prompt_versions')
      .select('version')
      .eq('flow_id', flowId)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    const nextVersion = (lastVersion?.version || 0) + 1;
    
    let initialData = {
      content: '',
      variables_schema: {},
      rules: {}
    };

    if (cloneFromVersionId) {
      const { data: source } = await supabase
        .from('prompt_versions')
        .select('content, variables_schema, rules')
        .eq('id', cloneFromVersionId)
        .single();
      if (source) initialData = source;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('prompt_versions')
      .insert({
        flow_id: flowId,
        version: nextVersion,
        status: 'draft',
        ...initialData,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    
    await logAuditAction('create_version', 'prompt_version', data.id, null, data);
    return data;
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
};

export const setActiveVersion = async (flowKey, versionId) => {
  try {
    // Fetch current config
    const { data: config } = await supabase.from('bot_config').select('*').single();
    if (!config) throw new Error('Bot config not found');

    const newActiveVersions = {
      ...config.active_versions,
      [flowKey]: versionId
    };

    const { error } = await supabase
      .from('bot_config')
      .update({ active_versions: newActiveVersions, updated_at: new Date().toISOString() })
      .eq('id', config.id);

    if (error) throw error;
    
    await logAuditAction('set_active_version', 'prompt_flow', null, { old_version: config.active_versions[flowKey] }, { new_version: versionId, flow: flowKey });
  } catch (error) {
    console.error('Error setting active version:', error);
    throw error;
  }
};
