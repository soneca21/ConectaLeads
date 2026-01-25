
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, MessageCircle, Phone, Save, Calendar, User } from 'lucide-react';
import ScoreBar from '@/components/admin/ScoreBar';
import TimelineEvent from '@/components/admin/TimelineEvent';

const AdminLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lead, setLead] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '', email: '', score: 0, source: '' });
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qualifications, setQualifications] = useState(null);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      // Fetch lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError) throw leadError;
      setLead(leadData);
      setEditData({
        name: leadData.name || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        score: leadData.score || 0,
        source: leadData.source || ''
      });

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });
      
      setEvents(eventsData || []);

      // Fetch qualifications
      const { data: qualData } = await supabase
        .from('lead_qualifications')
        .select('*')
        .eq('lead_id', id)
        .single();
        
      setQualifications(qualData || {});
      
    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os detalhes do lead"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (newStage) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ stage: newStage })
        .eq('id', id);

      if (error) throw error;

      setLead(prev => ({ ...prev, stage: newStage }));
      toast({ title: "Estágio Atualizado", description: `Lead movido para ${newStage}` });
    } catch (error) {
      toast({ variant: "destructive", title: "Falha na Atualização", description: error.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('leads').update(editData).eq('id', id);
      if (error) throw error;
      setLead(prev => ({ ...prev, ...editData }));
      toast({ title: 'Sucesso', description: 'Lead atualizado com sucesso!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (lead?.phone) {
       window.open(`https://wa.me/${lead.phone}`, '_blank');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando detalhes do lead...</div>;
  if (!lead) return <div className="p-8 text-center text-red-500">Lead não encontrado</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/leads')} className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
          <p className="text-gray-500 text-sm">Lead ID: {lead.id}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" className="border-green-500/50 text-green-500 hover:bg-green-500/10" onClick={handleWhatsAppClick}>
            <MessageCircle size={18} className="mr-2" /> WhatsApp
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={saving}>
            <Save size={18} className="mr-2" /> {saving ? 'Salvando...' : 'Salvar Mudanças'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Score */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lead Score</h3>
            <ScoreBar score={lead.score || 0} />
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Estágio</label>
                <select 
                  className="w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white focus:border-orange-500 outline-none"
                  value={lead.stage}
                  onChange={(e) => updateStage(e.target.value)}
                >
                  <option value="new">Novo</option>
                  <option value="qualifying">Qualificando</option>
                  <option value="proposal">Proposta</option>
                  <option value="negotiation">Negociação</option>
                  <option value="won">Ganho</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>

              <div>
                 <label className="text-xs text-gray-500 uppercase">Informações de Contato</label>
                 <div className="flex flex-col gap-2 mt-2">
                   <label className="flex items-center gap-2 text-gray-300">
                     <Phone size={16} className="text-gray-500" />
                     <input name="phone" value={editData.phone} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                   </label>
                   <label className="flex items-center gap-2 text-gray-300">
                     <User size={16} className="text-gray-500" />
                     <input name="source" value={editData.source} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                   </label>
                   <label className="flex items-center gap-2 text-gray-300">
                     <span className="text-gray-500">Email:</span>
                     <input name="email" value={editData.email} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                   </label>
                   <label className="flex items-center gap-2 text-gray-300">
                     <span className="text-gray-500">Score:</span>
                     <input name="score" type="number" value={editData.score} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                   </label>
                   <label className="flex items-center gap-2 text-gray-300">
                     <span className="text-gray-500">Nome:</span>
                     <input name="name" value={editData.name} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                   </label>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Qualificações</h3>
            <div className="space-y-3">
               <div>
                 <span className="text-xs text-gray-500">Faixa de Orçamento</span>
                 <p className="text-white">{qualifications?.budget_range || 'Não definido'}</p>
               </div>
               <div>
                 <span className="text-xs text-gray-500">Interesse</span>
                 <p className="text-white">{qualifications?.category_interest || 'Não definido'}</p>
               </div>
               <div>
                 <span className="text-xs text-gray-500">Urgência</span>
                 <Badge variant="outline" className="border-orange-500/50 text-orange-500 mt-1">
                   {qualifications?.urgency || 'Normal'}
                 </Badge>
               </div>
               <div>
                 <span className="text-xs text-gray-500">Notas</span>
                 <p className="text-gray-400 text-sm mt-1 bg-[#0a0a0a] p-2 rounded">
                   {qualifications?.notes || 'Nenhuma nota disponível.'}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Timeline */}
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Linha do Tempo</h3>
          <div className="pl-2">
            {events.length > 0 ? (
              events.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))
            ) : (
              <p className="text-gray-500">Nenhuma atividade registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadDetail;
