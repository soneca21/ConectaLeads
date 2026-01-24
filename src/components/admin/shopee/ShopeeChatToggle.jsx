
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';

const ShopeeChatToggle = ({ status }) => {
  // In a real implementation, this would toggle a DB setting
  // For now, it's a visual indicator based on 'status'
  
  const isEnabled = status === 'available';

  return (
    <Card className="bg-[#1a1a1a] border-white/5">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isEnabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/20 text-gray-500'}`}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h4 className="text-white font-medium">Shopee Chat Sync</h4>
            <p className="text-sm text-gray-400">
              {status === 'available' ? 'Chat API is active and syncing.' : 
               status === 'restricted' ? 'Chat API limited (Read-only).' : 
               'Chat API not connected.'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Switch 
              checked={isEnabled} 
              disabled={true} // Disabled for now as it's just a status indicator
              aria-label="Toggle Shopee Chat Sync"
            />
            <span className={`text-sm ${isEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopeeChatToggle;
