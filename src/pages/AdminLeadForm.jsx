import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const stages = [
  { value: 'new', label: 'Novo' },
  { value: 'qualifying', label: 'Qualificando' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' }
];

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
    stage: 'new',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) fetchLead();
  }, [id]);

  const fetchLead = async () => {
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
    if (data) setFormData(data);
    setInitialLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
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
      let result;
      if (isEdit) {
        result = await supabase.from('leads').update(formData).eq('id', id);
      } else {
        result = await supabase.from('leads').insert([{ ...formData }]);
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
    <div className="max-w-lg mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft /> Voltar</Button>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input label="Nome" name="name" value={formData.name} onChange={handleChange} required />
          {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}
        </div>
        <div>
          <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} required />
          {errors.phone && <span className="text-red-500 text-xs ml-1">{errors.phone}</span>}
        </div>
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
        <Input label="Score" name="score" type="number" value={formData.score} onChange={handleChange} />
        <Input label="Origem" name="source" value={formData.source} onChange={handleChange} />
        <label className="block text-sm font-medium text-gray-300">Estágio
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-[#0a0a0a] border border-white/10 p-2 text-white"
            required
          >
            <option value="new">Novo</option>
            <option value="qualifying">Qualificando</option>
            <option value="proposal">Proposta</option>
            <option value="won">Ganho</option>
            <option value="lost">Perdido</option>
          </select>
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Save />} Salvar</Button>
          <Button type="button" variant="outline" onClick={handleWhatsApp} disabled={!/^\+?\d{10,15}$/.test(formData.phone)}>Abrir WhatsApp</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminLeadForm;
