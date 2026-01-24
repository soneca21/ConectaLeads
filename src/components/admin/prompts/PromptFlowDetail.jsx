
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Check, Archive, Rocket } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createPromptVersion, setActiveVersion, logAuditAction } from '@/lib/prompt-utils';
import PromptVersionEditor from './PromptVersionEditor';
import PromptVersionHistory from './PromptVersionHistory';

const PromptFlowDetail = ({ flowId, onBack }) => {
  const [flow, setFlow] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [flowId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Flow
      const { data: flowData } = await supabase.from('prompt_flows').select('*').eq('id', flowId).single();
      setFlow(flowData);

      // Fetch Config for Active Version
      const { data: config } = await supabase.from('bot_config').select('active_versions').single();
      setActiveVersionId(config?.active_versions?.[flowData.key]);

      // Fetch Versions
      const { data: versionsData } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('flow_id', flowId)
        .order('version', { ascending: false });
      
      setVersions(versionsData || []);
      
      if (versionsData?.length > 0 && !selectedVersion) {
         // Default select active, or latest published, or latest
         const active = versionsData.find(v => v.id === config?.active_versions?.[flowData.key]);
         const latest = versionsData[0];
         setSelectedVersion(active || latest);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    try {
      // Clone from latest published or selected
      const sourceId = selectedVersion?.id;
      const newVersion = await createPromptVersion(flowId, sourceId);
      
      setVersions([newVersion, ...versions]);
      setSelectedVersion(newVersion);
      toast({ title: "New Version Created", description: `Draft v${newVersion.version} created.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create version." });
    }
  };

  const handlePublish = async () => {
    if (!selectedVersion) return;
    try {
      const { error } = await supabase
        .from('prompt_versions')
        .update({ status: 'published' })
        .eq('id', selectedVersion.id);
      
      if (error) throw error;
      
      await logAuditAction('publish_version', 'prompt_version', selectedVersion.id, { status: 'draft' }, { status: 'published' });
      
      setVersions(versions.map(v => v.id === selectedVersion.id ? { ...v, status: 'published' } : v));
      setSelectedVersion({ ...selectedVersion, status: 'published' });
      toast({ title: "Published", description: `Version v${selectedVersion.version} is now published.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleSetActive = async () => {
    if (!selectedVersion || !flow) return;
    try {
      await setActiveVersion(flow.key, selectedVersion.id);
      setActiveVersionId(selectedVersion.id);
      toast({ title: "Active Version Updated", description: `Bot will now use v${selectedVersion.version}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading flow details...</div>;
  if (!flow) return <div className="p-8 text-center text-red-500">Flow not found.</div>;

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {flow.name}
              <Badge variant="outline" className="text-gray-400 font-mono text-xs">{flow.key}</Badge>
            </h2>
            <p className="text-gray-500 text-sm">{flow.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleCreateVersion} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
             <Plus size={16} className="mr-2" /> New Version
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Sidebar History */}
        <div className="col-span-3 bg-[#111] rounded-xl border border-white/5 p-4 overflow-y-auto">
          <PromptVersionHistory 
             versions={versions} 
             activeVersionId={activeVersionId}
             selectedVersionId={selectedVersion?.id}
             onSelect={setSelectedVersion}
          />
        </div>

        {/* Editor Area */}
        <div className="col-span-9 flex flex-col h-full overflow-hidden">
          {selectedVersion ? (
            <>
              {/* Toolbar */}
              <div className="bg-[#1a1a1a] border-x border-t border-white/5 rounded-t-xl p-3 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Actions for v{selectedVersion.version}:</span>
                 </div>
                 <div className="flex gap-2">
                   {selectedVersion.status === 'draft' && (
                     <Button size="sm" onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white h-8">
                       <Check size={14} className="mr-1" /> Publish
                     </Button>
                   )}
                   {selectedVersion.status === 'published' && activeVersionId !== selectedVersion.id && (
                     <Button size="sm" onClick={handleSetActive} className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                       <Rocket size={14} className="mr-1" /> Set as Active
                     </Button>
                   )}
                   {selectedVersion.status !== 'archived' && (
                     <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400 h-8">
                       <Archive size={14} />
                     </Button>
                   )}
                 </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <PromptVersionEditor 
                  version={selectedVersion} 
                  flowKey={flow.key}
                  onSaveSuccess={fetchData}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 border border-white/5 rounded-xl border-dashed">
              Select a version to view or edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptFlowDetail;
