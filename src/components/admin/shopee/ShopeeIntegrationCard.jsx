
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingBag, RefreshCw, Unplug, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const ShopeeIntegrationCard = () => {
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const { data } = await supabase.from('shopee_integrations').select('*').limit(1).single();
      setIntegration(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('shopee-auth-start');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Connection Failed", description: e.message });
    }
  };

  const handleDisconnect = async () => {
    try {
      await supabase.from('shopee_integrations').delete().eq('id', integration.id);
      setIntegration(null);
      toast({ title: "Disconnected", description: "Shopee integration removed." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleRefreshToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('shopee-refresh-token');
      if (error) throw error;
      toast({ title: "Token Refreshed", description: data.message });
      fetchIntegration();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading Shopee status...</div>;

  const isConnected = integration?.is_connected;

  return (
    <Card className="bg-[#1a1a1a] border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShoppingBag className="text-orange-500" /> Shopee Integration
        </CardTitle>
        <CardDescription className="text-gray-400">
          Sync orders, products, and chat messages directly from your Shopee store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-green-900/10 border border-green-900/30 p-4 rounded-lg">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <div>
                   <h4 className="text-green-500 font-medium">Connected</h4>
                   <p className="text-xs text-gray-400">Shop ID: {integration.shop_id}</p>
                 </div>
               </div>
               <div className="text-xs text-gray-500 text-right">
                 Last update: {formatDistanceToNow(new Date(integration.updated_at), { addSuffix: true, locale: ptBR })}
               </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshToken} className="border-white/10 text-white hover:bg-white/5">
                <RefreshCw size={14} className="mr-2" /> Refresh Token
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDisconnectOpen(true)} className="bg-red-900/20 text-red-500 hover:bg-red-900/30 border border-red-900/50">
                <Unplug size={14} className="mr-2" /> Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-500">
               <ShoppingBag size={32} />
             </div>
             <p className="text-gray-400 text-sm max-w-sm mx-auto">
               Connect your shop to automatically import orders and chat with customers.
             </p>
             <Button onClick={handleConnect} className="bg-orange-600 hover:bg-orange-700 text-white">
               <ExternalLink size={16} className="mr-2" /> Connect Shopee Account
             </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog 
        isOpen={isDisconnectOpen} 
        onClose={() => setIsDisconnectOpen(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Shopee?"
        message="This will stop all syncs. Existing data will remain but no new orders or messages will be received."
        confirmText="Disconnect"
        isDestructive={true}
      />
    </Card>
  );
};

export default ShopeeIntegrationCard;
