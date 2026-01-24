
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Settings2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PromptFlowsList = ({ onSelectFlow }) => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('prompt_flows')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setFlows(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlows();
  }, []);

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
      <Table>
        <TableHeader className="bg-[#252525]">
          <TableRow className="border-white/5">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Key</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Created</TableHead>
            <TableHead className="text-right text-gray-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading flows...</TableCell></TableRow>
          ) : flows.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No prompt flows found.</TableCell></TableRow>
          ) : (
            flows.map((flow) => (
              <TableRow key={flow.id} className="border-white/5 hover:bg-[#252525]">
                <TableCell className="font-medium text-white">
                  <div>{flow.name}</div>
                  <div className="text-xs text-gray-500">{flow.description}</div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-[#0a0a0a] px-1.5 py-0.5 rounded text-gray-300">{flow.key}</code>
                </TableCell>
                <TableCell>
                   <Badge variant="outline" className={flow.is_active ? "border-green-500/30 text-green-500" : "border-gray-500 text-gray-500"}>
                     {flow.is_active ? 'Active' : 'Inactive'}
                   </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                   {formatDistanceToNow(new Date(flow.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onSelectFlow(flow.id)} className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10">
                    Manage <ArrowRight size={16} className="ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PromptFlowsList;
