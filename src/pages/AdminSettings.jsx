
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'colaborador' });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [generalForm, setGeneralForm] = useState({ companyName: 'ConectaLeads', supportPhone: '+55 11 99999-9999', whatsappNumber: '5511999999999' });
  const [savingGeneral, setSavingGeneral] = useState(false);
  const { t, i18n } = useTranslation();
  useEffect(() => { fetchUsers(); }, []);
  async function fetchUsers() {
    setLoadingUsers(true);
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoadingUsers(false);
  }
  async function handleCreateUser() {
    if (!userForm.name || !userForm.email) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Nome e email obrigatórios.' });
      return;
    }
    const { error } = await supabase.from('users').insert([{ ...userForm }]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Usuário Criado', description: 'Convite enviado.' });
      setIsUserModalOpen(false);
      setUserForm({ name: '', email: '', role: 'colaborador' });
      fetchUsers();
    }
  }

  const handleSave = () => {
    toast({ title: "Configurações Salvas", description: "Alterações aplicadas com sucesso." });
  };

  useEffect(() => {
    const fetchGeneralSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['company_name', 'support_phone', 'whatsapp_number', 'language']);
      if (!error && data) {
        const map = Object.fromEntries(data.map(item => [item.key, item.value]));
        setGeneralForm(prev => ({
          companyName: map.company_name || prev.companyName,
          supportPhone: map.support_phone || prev.supportPhone,
          whatsappNumber: (map.whatsapp_number || prev.whatsappNumber || '').replace(/\\D/g, '')
        }));
        if (map.language) {
          loadLanguage(map.language);
        }
      }
    };
    fetchGeneralSettings();
  }, []);

  const handleSaveGeneral = async () => {
    try {
      setSavingGeneral(true);
      const payload = [
        { key: 'company_name', value: generalForm.companyName },
        { key: 'support_phone', value: generalForm.supportPhone },
        { key: 'whatsapp_number', value: generalForm.whatsappNumber },
        { key: 'language', value: i18n.language }
      ];
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'key' });
      if (error) throw error;
      toast({ title: "Configurações salvas", description: "Dados atualizados com sucesso." });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setSavingGeneral(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-[#1a1a1a] border border-white/5 p-1 rounded-lg">
          <TabsTrigger value="users" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">{t('settings.tabs.users')}</TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">{t('settings.tabs.integrations')}</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">{t('settings.tabs.templates')}</TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">{t('settings.tabs.general')}</TabsTrigger>
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
                {loadingUsers ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Nenhum usuário encontrado.</TableCell></TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id} className="border-white/5">
                      <TableCell className="text-white">{user.name}</TableCell>
                      <TableCell className="text-gray-400">{user.email}</TableCell>
                      <TableCell><span className={user.role === 'admin' ? 'bg-purple-500/20 text-purple-500 px-2 py-1 rounded text-xs' : 'bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs'}>{user.role}</span></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-red-400"><Trash2 size={16} /></Button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                 <ShopeeIntegrationCard />
                 <ShopeeChatToggle status="available" />
                 <Button className="bg-orange-600 w-full" onClick={async () => {
                   try {
                     // Chama função serverless para iniciar auth Shopee
                     const { data, error } = await window.supabase.functions.invoke('shopee-auth-start');
                     if (error) throw error;
                     if (data?.url) {
                       window.location.href = data.url;
                     } else {
                       throw new Error('URL de autenticação não recebida.');
                     }
                   } catch (err) {
                     toast({ variant: 'destructive', title: 'Erro', description: err.message });
                   }
                 }}>
                   Conectar com Shopee
                 </Button>
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
               <label className="text-sm text-gray-400">{t('settings.general.companyName')}</label>
               <Input
                 className="bg-[#0a0a0a] border-white/10 text-white mt-1"
                 value={generalForm.companyName}
                 onChange={(e) => setGeneralForm(f => ({ ...f, companyName: e.target.value }))}
               />
             </div>
             <div>
               <label className="text-sm text-gray-400">{t('settings.general.supportPhone')}</label>
               <Input
                 className="bg-[#0a0a0a] border-white/10 text-white mt-1"
                 value={generalForm.supportPhone}
                 onChange={(e) => setGeneralForm(f => ({ ...f, supportPhone: e.target.value }))}
               />
             </div>
             <div>
               <label className="text-sm text-gray-400">{t('settings.general.whatsappNumber')}</label>
               <Input
                 className="bg-[#0a0a0a] border-white/10 text-white mt-1"
                 value={generalForm.whatsappNumber}
                 onChange={(e) => setGeneralForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                 placeholder="5511999999999"
               />
             </div>
             <div>
               <label className="text-sm text-gray-400">{t('settings.general.language')}</label>
               <select
                 value={i18n.language}
                 onChange={async (e) => {
                   await loadLanguage(e.target.value);
                 }}
                 className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1"
               >
                 <option value="pt">Português</option>
                 <option value="en">English</option>
               </select>
             </div>
             <Button
               className="bg-orange-600 hover:bg-orange-700"
               onClick={handleSaveGeneral}
               disabled={savingGeneral}
             >
               {savingGeneral ? 'Salvando...' : t('settings.general.save')}
             </Button>
            </div>
        </TabsContent>
      </Tabs>

      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Adicionar Novo Usuário">
         <div className="space-y-4">
           <Input placeholder="Nome" className="bg-[#0a0a0a] border-white/10 text-white" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} />
           <Input placeholder="Email" className="bg-[#0a0a0a] border-white/10 text-white" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} />
           <select className="bg-[#0a0a0a] border-white/10 text-white w-full p-2 rounded" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
             <option value="colaborador">Colaborador</option>
             <option value="admin">Admin</option>
           </select>
           <Button className="w-full bg-orange-600" onClick={handleCreateUser}>Criar Usuário</Button>
         </div>
      </Modal>
    </div>
  );
};

export default AdminSettings;
