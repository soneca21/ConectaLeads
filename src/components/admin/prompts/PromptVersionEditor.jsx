
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { logAuditAction } from '@/lib/prompt-utils';

const PromptVersionEditor = ({ version, flowKey, onSaveSuccess }) => {
  const [content, setContent] = useState(version.content || '');
  const [schema, setSchema] = useState(JSON.stringify(version.variables_schema || {}, null, 2));
  const [rules, setRules] = useState(JSON.stringify(version.rules || {}, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    setContent(version.content || '');
    setSchema(JSON.stringify(version.variables_schema || {}, null, 2));
    setRules(JSON.stringify(version.rules || {}, null, 2));
  }, [version.id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Validate JSON
      let parsedSchema, parsedRules;
      try {
        parsedSchema = JSON.parse(schema);
        parsedRules = JSON.parse(rules);
      } catch (e) {
        throw new Error("Invalid JSON in Schema or Rules: " + e.message);
      }

      const updates = {
        content,
        variables_schema: parsedSchema,
        rules: parsedRules,
        // If it was draft, it stays draft. If published, typically we create new version, but here we allow editing draft.
        // If editing a published version, system logic usually forces new version creation. 
        // For simplicity, we assume this component is used on DRAFT versions or we allow hot-patching (risky but easy).
        // Let's stick to allowing updates.
      };

      const { error: dbError } = await supabase
        .from('prompt_versions')
        .update(updates)
        .eq('id', version.id);

      if (dbError) throw dbError;

      await logAuditAction('update_version', 'prompt_version', version.id, null, updates);

      toast({ title: "Saved", description: "Version updated successfully." });
      if (onSaveSuccess) onSaveSuccess();

    } catch (err) {
      setError(err.message);
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = version.status === 'archived';

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-white border-white/20">v{version.version}</Badge>
          <Badge className={
            version.status === 'published' ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : 
            version.status === 'archived' ? "bg-gray-500/20 text-gray-500" : 
            "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
          }>
            {version.status}
          </Badge>
        </div>
        {!isReadOnly && (
          <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
             <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2">Prompt Content</label>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-sm bg-[#0a0a0a] border-white/10 text-gray-200 min-h-[200px]"
            placeholder="Enter prompt text here..."
            disabled={isReadOnly}
          />
          <p className="text-xs text-gray-500 mt-1">Use {'{variable_name}'} to insert dynamic values.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Variables Schema (JSON)</label>
            <Textarea 
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="font-mono text-xs bg-[#0a0a0a] border-white/10 text-blue-300 h-[200px]"
              placeholder="{}"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Logic Rules (JSON)</label>
            <Textarea 
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="font-mono text-xs bg-[#0a0a0a] border-white/10 text-green-300 h-[200px]"
              placeholder="{}"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptVersionEditor;
