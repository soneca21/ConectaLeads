
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Package, ShoppingCart, MessageCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const ShopeeSyncPanel = () => {
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('shopee_sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setLogs(data || []);
  };

  const handleSync = async (type) => {
    setSyncing(true);
    try {
      const endpoint = type === 'orders' ? 'shopee-sync-orders' : type === 'products' ? 'shopee-sync-products' : 'shopee-sync-chat';
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: type === 'orders' ? { days: 7 } : {}
      });
      
      if (error) throw error;
      
      toast({ title: "Sync Started", description: `Processed ${data.processed || 0} records.` });
      fetchLogs();
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="bg-[#1a1a1a] border-white/5">
      <CardHeader>
        <CardTitle className="text-white text-lg">Sync Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" disabled={syncing} onClick={() => handleSync('orders')} className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 text-white hover:bg-white/5">
            <ShoppingCart size={24} className="text-blue-500" />
            <span>Sync Orders</span>
          </Button>
          <Button variant="outline" disabled={syncing} onClick={() => handleSync('products')} className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 text-white hover:bg-white/5">
            <Package size={24} className="text-orange-500" />
            <span>Sync Products</span>
          </Button>
          <Button variant="outline" disabled={syncing} onClick={() => handleSync('chat')} className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 text-white hover:bg-white/5">
            <MessageCircle size={24} className="text-green-500" />
            <span>Sync Chat</span>
          </Button>
        </div>

        <div>
           <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Logs</h4>
           <div className="rounded-md border border-white/5 overflow-hidden">
             <Table>
               <TableHeader className="bg-[#252525]">
                 <TableRow className="border-white/5">
                   <TableHead className="text-gray-400">Type</TableHead>
                   <TableHead className="text-gray-400">Status</TableHead>
                   <TableHead className="text-gray-400">Count</TableHead>
                   <TableHead className="text-gray-400">Time</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {logs.map((log) => (
                   <TableRow key={log.id} className="border-white/5">
                     <TableCell className="capitalize text-gray-300">{log.sync_type}</TableCell>
                     <TableCell>
                       {log.status === 'success' ? (
                         <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded">Success</span>
                       ) : (
                         <span className="text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded flex items-center gap-1">
                           <AlertCircle size={10} /> Error
                         </span>
                       )}
                     </TableCell>
                     <TableCell className="text-gray-300">{log.records_processed}</TableCell>
                     <TableCell className="text-gray-500 text-xs">
                       {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                     </TableCell>
                   </TableRow>
                 ))}
                 {logs.length === 0 && (
                   <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-4">No logs yet.</TableCell></TableRow>
                 )}
               </TableBody>
             </Table>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopeeSyncPanel;
