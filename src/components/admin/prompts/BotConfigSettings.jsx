
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Copy, AlertTriangle, Eye, EyeOff, Terminal } from 'lucide-react';
import { generateBotToken, logAuditAction } from '@/lib/prompt-utils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const BotConfigSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.from('bot_config').select('*').single();
      if (error) throw error;
      setConfig(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      const newToken = generateBotToken();
      const oldToken = config.make_bot_token;
      
      const { error } = await supabase
        .from('bot_config')
        .update({ make_bot_token: newToken, updated_at: new Date().toISOString() })
        .eq('id', config.id);

      if (error) throw error;

      await logAuditAction('regenerate_token', 'bot_config', config.id, { token_masked: '****' }, { token_masked: '****' });
      
      setConfig({ ...config, make_bot_token: newToken });
      toast({ title: "Token Regenerated", description: "Remember to update your Make.com scenarios!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  const endpointUrl = `${window.location.origin.replace('3000', '54321')}/functions/v1/get-bot-config?flow=whatsapp_qualify`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-[#1a1a1a] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="text-orange-500" /> API Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Securely connect your Make.com bots to pull dynamic prompts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Token Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bot Access Token (X-BOT-TOKEN)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  value={showToken ? config?.make_bot_token : '•'.repeat(32)} 
                  readOnly 
                  className="bg-[#0a0a0a] border-white/10 text-white pr-10 font-mono"
                />
                <button 
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button variant="outline" className="border-white/10 text-white" onClick={() => copyToClipboard(config?.make_bot_token, "Token")}>
                <Copy size={16} />
              </Button>
              <Button className="bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50" onClick={() => setConfirmRegen(true)}>
                <RefreshCw size={16} className="mr-2" /> Regenerate
              </Button>
            </div>
            <p className="text-xs text-yellow-500/80 flex items-center gap-1 mt-1">
              <AlertTriangle size={12} /> Treat this token like a password. Do not share it publicly.
            </p>
          </div>

          {/* Endpoint Section */}
          <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Example API Endpoint</label>
             <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/10 font-mono text-sm overflow-x-auto">
               <div className="flex items-center gap-2 text-green-400 mb-2">
                 <span className="bg-green-900/30 px-2 py-0.5 rounded text-xs">GET</span>
                 <span className="text-gray-300">/api/bot-config?flow=whatsapp_qualify</span>
               </div>
               <div className="text-gray-500 mb-2"># Headers</div>
               <div className="text-blue-400">X-BOT-TOKEN: <span className="text-white">{config?.make_bot_token?.substring(0,8)}...</span></div>
             </div>
             <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => copyToClipboard(endpointUrl, "Endpoint URL")}>
                <Copy size={14} className="mr-2" /> Copy Full Endpoint URL
             </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog 
        isOpen={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        onConfirm={handleRegenerateToken}
        title="Regenerate Bot Token?"
        message="This will invalidate the current token immediately. All external bots/workflows using the old token will stop working until updated."
        confirmText="Yes, Regenerate"
        isDestructive={true}
      />
    </div>
  );
};

export default BotConfigSettings;
