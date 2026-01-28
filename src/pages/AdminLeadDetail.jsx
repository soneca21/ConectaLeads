import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, MessageCircle, Phone, Save, Calendar, User, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import ScoreBar from '@/components/admin/ScoreBar';
import TimelineEvent from '@/components/admin/TimelineEvent';
import { fetchStages } from '@/lib/pipeline';

const AdminLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lead, setLead] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qualifications, setQualifications] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newInteraction, setNewInteraction] = useState({ type: 'call', channel: 'whatsapp', content: '' });
  const [newTask, setNewTask] = useState({ title: '', due_at: '', priority: 'normal', channel: '' });
  const [stages, setStages] = useState([]);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const { data: leadData } = await supabase.from('leads').select('*').eq('id', id).single();
      if (!leadData) throw new Error('Lead não encontrado');
      setLead(leadData);
      setEditData({
        name: leadData.name || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        score: leadData.score || 0,
        source: leadData.source || '',
        stage: leadData.stage || 'new',
        city: leadData.city || '',
        country: leadData.country || '',
        company: leadData.company || '',
        job_title: leadData.job_title || '',
        industry: leadData.industry || '',
        potential_value: leadData.potential_value || '',
        currency: leadData.currency || 'BRL'
      });

      if (leadData.pipeline_id) {
        const st = await fetchStages(leadData.pipeline_id);
        setStages(st);
      }

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });
      setEvents(eventsData || []);

      const { data: qualData } = await supabase
        .from('lead_qualifications')
        .select('*')
        .eq('lead_id', id)
        .single();
      setQualifications(qualData || {});

      const { data: interactionsData } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });
      setInteractions(interactionsData || []);

      const { data: tasksData } = await supabase
        .from('lead_tasks')
        .select('*')
        .eq('lead_id', id)
        .order('due_at', { ascending: true });
      setTasks(tasksData || []);
      
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
      toast({ title: "Estágio atualizado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Falha", description: error.message });
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

  const addInteraction = async () => {
    if (!newInteraction.content.trim()) return;
    const payload = { ...newInteraction, lead_id: id };
    const { error } = await supabase.from('lead_interactions').insert([payload]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível registrar interação' });
      return;
    }
    setNewInteraction({ type: 'call', channel: 'whatsapp', content: '' });
    fetchLeadData();
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    const payload = { ...newTask, lead_id: id };
    const { error } = await supabase.from('lead_tasks').insert([payload]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar tarefa' });
      return;
    }
    setNewTask({ title: '', due_at: '', priority: 'normal', channel: '' });
    fetchLeadData();
  };

  const tasksOpen = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);

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
                  {stages.length ? stages.map(s => <option key={s.id} value={s.key || s.name}>{s.name}</option>) : (
                    <>
                      <option value="new">Novo</option>
                      <option value="qualifying">Qualificando</option>
                      <option value="proposal">Proposta</option>
                      <option value="negotiation">Negociação</option>
                      <option value="won">Ganho</option>
                      <option value="lost">Perdido</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2">
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
                  <span className="text-gray-500">Empresa:</span>
                  <input name="company" value={editData.company} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <span className="text-gray-500">Cargo:</span>
                  <input name="job_title" value={editData.job_title} onChange={handleChange} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white w-full" />
                </label>
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

        {/* Middle Column: Timeline & Interactions */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Linha do Tempo</h3>
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

          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Interações</h3>
              <div className="flex gap-2">
                <select value={newInteraction.type} onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value }))} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm">
                  <option value="call">Chamada</option>
                  <option value="email">Email</option>
                  <option value="message">Mensagem</option>
                  <option value="meeting">Reunião</option>
                  <option value="note">Nota</option>
                </select>
                <select value={newInteraction.channel} onChange={(e) => setNewInteraction(prev => ({ ...prev, channel: e.target.value }))} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>
            <Textarea value={newInteraction.content} onChange={(e) => setNewInteraction(prev => ({ ...prev, content: e.target.value }))} placeholder="Resumo da interação..." className="bg-[#0a0a0a] border-white/10 text-white mb-3" />
            <Button onClick={addInteraction} className="bg-orange-600 hover:bg-orange-700"><Plus size={14} className="mr-2" />Registrar</Button>

            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {interactions.map(inter => (
                <div key={inter.id} className="border border-white/5 rounded-md p-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="uppercase">{inter.type} • {inter.channel}</span>
                    <span>{new Date(inter.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-white mt-1 text-sm">{inter.content}</p>
                </div>
              ))}
              {interactions.length === 0 && <p className="text-gray-500 text-sm">Sem interações.</p>}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tarefas & Follow-ups</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input placeholder="Título" value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} />
              <Input type="datetime-local" value={newTask.due_at} onChange={(e) => setNewTask(prev => ({ ...prev, due_at: e.target.value }))} />
              <select value={newTask.priority} onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm">
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <Button onClick={addTask} className="bg-orange-600 hover:bg-orange-700"><Clock size={14} className="mr-2" />Criar tarefa</Button>

            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {tasksOpen.map(task => (
                <div key={task.id} className="border border-white/5 rounded-md p-3 flex items-start gap-3">
                  <Clock size={16} className="text-orange-400 mt-1" />
                  <div>
                    <p className="text-white font-semibold">{task.title}</p>
                    <p className="text-xs text-gray-500">Vencimento: {task.due_at ? new Date(task.due_at).toLocaleString() : 'Sem data'}</p>
                    <Badge variant="outline" className="mt-1">{task.priority}</Badge>
                  </div>
                </div>
              ))}
              {tasksOpen.length === 0 && <p className="text-gray-500 text-sm">Sem tarefas abertas.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadDetail;

