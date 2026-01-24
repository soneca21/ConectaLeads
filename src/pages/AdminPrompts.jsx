
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare as MessageSquareCode, Settings } from 'lucide-react';
import PromptFlowsList from '@/components/admin/prompts/PromptFlowsList';
import PromptFlowDetail from '@/components/admin/prompts/PromptFlowDetail';
import BotConfigSettings from '@/components/admin/prompts/BotConfigSettings';

const AdminPrompts = () => {
  const [activeView, setActiveView] = useState('list'); // list, detail
  const [selectedFlowId, setSelectedFlowId] = useState(null);

  const handleSelectFlow = (id) => {
    setSelectedFlowId(id);
    setActiveView('detail');
  };

  const handleBack = () => {
    setSelectedFlowId(null);
    setActiveView('list');
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Bot & Prompts</h1>
      </div>

      <Tabs defaultValue="flows" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-[#1a1a1a] border border-white/5 p-1 rounded-lg w-fit mb-6">
          <TabsTrigger value="flows" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400 w-32">
            <MessageSquareCode size={16} className="mr-2" /> Flows
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400 w-32">
            <Settings size={16} className="mr-2" /> Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="flex-1 overflow-hidden mt-0">
          {activeView === 'list' ? (
            <PromptFlowsList onSelectFlow={handleSelectFlow} />
          ) : (
            <PromptFlowDetail flowId={selectedFlowId} onBack={handleBack} />
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-0 overflow-y-auto">
          <BotConfigSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPrompts;
