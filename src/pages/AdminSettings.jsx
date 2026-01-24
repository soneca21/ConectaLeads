
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/use-toast';
import ShopeeIntegrationCard from '@/components/admin/shopee/ShopeeIntegrationCard';
import ShopeeSyncPanel from '@/components/admin/shopee/ShopeeSyncPanel';
import ShopeeChatToggle from '@/components/admin/shopee/ShopeeChatToggle';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Configurações Salvas", description: "Alterações aplicadas com sucesso." });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-[#1a1a1a] border border-white/5 p-1 rounded-lg">
          <TabsTrigger value="users" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">Usuários</TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">Integrações</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">Templates</TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Membros da Equipe</h3>
            <Button className="bg-orange-600" onClick={() => setIsUserModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Novo Usuário
            </Button>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#252525]">
                <TableRow>
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Função</TableHead>
                  <TableHead className="text-gray-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-white/5">
                  <TableCell className="text-white">Usuário Admin</TableCell>
                  <TableCell className="text-gray-400">admin@example.com</TableCell>
                  <TableCell><span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded text-xs">Admin</span></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-red-400"><Trash2 size={16} /></Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                 <ShopeeIntegrationCard />
                 <ShopeeChatToggle status="available" />
              </div>
              <div className="space-y-6">
                 <ShopeeSyncPanel />
                 
                 {/* Existing/Other Integrations */}
                 <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 opacity-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">API WhatsApp (Z-API)</h3>
                      <XCircle className="text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm mb-4">Integração para envio de mensagens automáticas.</p>
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" disabled>Em breve</Button>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
           <h3 className="text-xl font-semibold text-white mb-4">Templates de Mensagem</h3>
           <div className="bg-[#1a1a1a] p-4 rounded-lg border border-white/5 text-gray-500 text-center py-10">
             Nenhum template criado ainda.
           </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
           <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 max-w-2xl space-y-4">
             <div>
               <label className="text-sm text-gray-400">Nome da Empresa</label>
               <Input className="bg-[#0a0a0a] border-white/10 text-white mt-1" defaultValue="ConectaLeads" />
             </div>
             <div>
               <label className="text-sm text-gray-400">Telefone de Suporte</label>
               <Input className="bg-[#0a0a0a] border-white/10 text-white mt-1" defaultValue="+55 11 99999-9999" />
             </div>
             <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave}>Salvar Mudanças</Button>
           </div>
        </TabsContent>
      </Tabs>

      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Adicionar Novo Usuário">
         <div className="space-y-4">
           <Input placeholder="Nome" className="bg-[#0a0a0a] border-white/10 text-white" />
           <Input placeholder="Email" className="bg-[#0a0a0a] border-white/10 text-white" />
           <Input placeholder="Senha" type="password" className="bg-[#0a0a0a] border-white/10 text-white" />
           <Button className="w-full bg-orange-600" onClick={() => {
             toast({ title: "Usuário Criado", description: "Convite enviado." });
             setIsUserModalOpen(false);
           }}>Criar Usuário</Button>
         </div>
      </Modal>
    </div>
  );
};

export default AdminSettings;
