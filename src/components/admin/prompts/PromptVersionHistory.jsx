
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PromptVersionHistory = ({ versions, activeVersionId, selectedVersionId, onSelect }) => {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">Version History</h3>
      <div className="space-y-1">
        {sortedVersions.map((ver) => {
           const isActive = activeVersionId === ver.id;
           const isSelected = selectedVersionId === ver.id;
           
           return (
             <div 
               key={ver.id}
               onClick={() => onSelect(ver)}
               className={cn(
                 "p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group",
                 isSelected ? "bg-orange-500/10 border-orange-500/30" : "bg-[#1a1a1a] border-white/5 hover:border-white/10"
               )}
             >
               <div className="flex items-center gap-3">
                 <div className={cn(
                   "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                   ver.status === 'published' ? "bg-green-500/20 text-green-500" : 
                   ver.status === 'archived' ? "bg-gray-700 text-gray-400" : "bg-yellow-500/20 text-yellow-500"
                 )}>
                   {ver.version}
                 </div>
                 <div>
                   <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                     {ver.status === 'published' ? 'Published' : ver.status === 'draft' ? 'Draft' : 'Archived'}
                     {isActive && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 rounded border border-blue-500/30">ACTIVE</span>}
                   </div>
                   <div className="text-xs text-gray-500">
                     {formatDistanceToNow(new Date(ver.created_at), { addSuffix: true, locale: ptBR })}
                   </div>
                 </div>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default PromptVersionHistory;
