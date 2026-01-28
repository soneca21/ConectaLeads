import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { fetchPipelines, fetchStages } from '@/lib/pipeline';

const AdminLeadForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    score: 0,
    source: '',
    channel: '',
    campaign: '',
    city: '',
    state: '',
    country: '',
    company: '',
    job_title: '',
    industry: '',
    company_size: '',
    budget_min: '',
    budget_max: '',
    potential_value: '',
    currency: 'BRL',
    tags: [],
    pipeline_id: '',
    pipeline_stage_id: '',
    stage: 'new',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [pipelines, setPipelines] = useState([]);
  const [stages, setStages] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadPipelines();
    if (isEdit) fetchLead();
  }, [id]);

  const loadPipelines = async () => {
    try {
      const data = await fetchPipelines();
      setPipelines(data);
      const defaultPipeline = data?.[0];
      if (defaultPipeline && !formData.pipeline_id) {
        setFormData(prev => ({ ...prev, pipeline_id: defaultPipeline.id }));
        loadStages(defaultPipeline.id);
      }
    } catch (err) {
      console.error('pipelines', err);
    }
  };

  const loadStages = async (pipelineId) => {
    try {
      const data = await fetchStages(pipelineId);
      setStages(data);
      if (data.length) {
        setFormData(prev => ({ ...prev, pipeline_stage_id: data[0].id, stage: data[0].key || 'new' }));
      }
    } catch (err) {
      console.error('stages', err);
    }
  };

  const fetchLead = async () => {
    const { data } = await supabase.from('leads').select('*').eq('id', id).single();
    if (data) {
      setFormData(prev => ({
        ...prev,
        ...data,
        budget_min: data.budget_min || '',
        budget_max: data.budget_max || '',
        potential_value: data.potential_value || '',
        tags: data.tags || [],
      }));
      if (data.pipeline_id) {
        await loadStages(data.pipeline_id);
      }
    }
    setInitialLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handlePipelineChange = async (e) => {
    const pipeline_id = e.target.value;
    setFormData(prev => ({ ...prev, pipeline_id }));
    await loadStages(pipeline_id);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setFormData(prev => ({ ...prev, tags: Array.from(new Set([...(prev.tags || []), tagInput.trim()])) }));
    setTagInput('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Nome é obrigatório.';
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório.';
    else if (!/^\+?\d{10,15}$/.test(formData.phone)) newErrors.phone = 'Telefone inválido.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha os campos obrigatórios corretamente.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...formData };
      let result;
      if (isEdit) {
        result = await supabase.from('leads').update(payload).eq('id', id);
      } else {
        result = await supabase.from('leads').insert([{ ...payload }]);
      }
      if (result.error) throw result.error;
      toast({ title: 'Sucesso', description: 'Lead salvo com sucesso!' });
      navigate('/admin/leads');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /> Carregando...</div>;

  const handleWhatsApp = () => {
    if (!formData.phone) return;
    const msg = encodeURIComponent('Olá, estou interessado no produto...');
    window.open(`https://wa.me/${formData.phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft /> Voltar</Button>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Lead' : 'Novo Lead'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 space-y-3 lg:col-span-2">
          <h3 className="text-white font-semibold">Dados do lead</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Nome" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} required />
            <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
            <Input label="Empresa" name="company" value={formData.company} onChange={handleChange} />
            <Input label="Cargo" name="job_title" value={formData.job_title} onChange={handleChange} />
            <Input label="Indústria" name="industry" value={formData.industry} onChange={handleChange} />
            <Input label="Tamanho da empresa" name="company_size" value={formData.company_size} onChange={handleChange} />
            <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} />
            <Input label="Estado" name="state" value={formData.state} onChange={handleChange} />
            <Input label="País" name="country" value={formData.country} onChange={handleChange} />
            <Input label="Origem (fonte)" name="source" value={formData.source} onChange={handleChange} />
            <Input label="Canal" name="channel" value={formData.channel} onChange={handleChange} />
            <Input label="Campanha" name="campaign" value={formData.campaign} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Score" name="score" type="number" value={formData.score} onChange={handleChange} />
            <Input label="Potencial (valor)" name="potential_value" type="number" value={formData.potential_value} onChange={handleChange} />
            <Input label="Moeda" name="currency" value={formData.currency} onChange={handleChange} />
            <Input label="Budget mín." name="budget_min" type="number" value={formData.budget_min} onChange={handleChange} />
            <Input label="Budget máx." name="budget_max" type="number" value={formData.budget_max} onChange={handleChange} />
          </div>

          <Textarea label="Notas" name="notes" value={formData.notes} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />

          <div>
            <p className="text-sm text-gray-300 mb-1">Tags</p>
            <div className="flex gap-2 mb-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="quente, carrinho, demo" />
              <Button type="button" variant="outline" onClick={addTag}><Plus size={14} /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-white/5 rounded border border-white/10 text-gray-200">{tag}</span>
              ))}
              {(formData.tags || []).length === 0 && <span className="text-xs text-gray-500">Sem tags</span>}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-semibold">Pipeline</h3>
          <label className="block text-sm text-gray-400">Funil
            <select
              name="pipeline_id"
              value={formData.pipeline_id}
              onChange={handlePipelineChange}
              className="mt-1 w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white"
            >
              <option value="">Selecione</option>
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-gray-400">Estágio
            <select
              name="pipeline_stage_id"
              value={formData.pipeline_stage_id}
              onChange={(e) => setFormData(prev => ({ ...prev, pipeline_stage_id: e.target.value, stage: stages.find(s => s.id === e.target.value)?.key || prev.stage }))}
              className="mt-1 w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white"
            >
              {stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
            </select>
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            Salvar Lead
          </Button>
          <Button type="button" variant="outline" onClick={handleWhatsApp} disabled={!/^\+?\d{10,15}$/.test(formData.phone)} className="w-full">
            Abrir WhatsApp
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminLeadForm;

