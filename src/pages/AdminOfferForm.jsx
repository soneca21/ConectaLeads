
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const AdminOfferForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    price: '',
    category: '',
    shopee_url: '',
    image_url: '',
    description: '',
    whatsapp_cta_text: 'Quero esse achado!',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchOffer();
    }
  }, [id]);

  const fetchOffer = async () => {
    const { data, error } = await supabase.from('offers').select('*').eq('id', id).single();
    if (data) setFormData(data);
    setInitialLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updates = { ...prev, [name]: value };
      // Auto-generate slug from title if not manually edited
      if (name === 'title' && !isEdit) {
        updates.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updates;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast({ variant: "destructive", title: "Erro", description: "Título e Slug são obrigatórios" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEdit) {
        result = await supabase.from('offers').update(payload).eq('id', id);
      } else {
        result = await supabase.from('offers').insert([{ ...payload, created_at: new Date().toISOString() }]);
      }

      if (result.error) throw result.error;

      toast({ title: "Sucesso", description: `Oferta ${isEdit ? 'atualizada' : 'criada'} com sucesso` });
      navigate('/admin/offers');
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (!error) {
      toast({ title: "Deletado", description: "Oferta removida" });
      navigate('/admin/offers');
    }
  };

  if (initialLoading) return <div className="p-8 text-center text-gray-500">Carregando formulário...</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/offers')} className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editar Oferta' : 'Nova Oferta'}</h1>
        {isEdit && (
          <Button variant="destructive" className="ml-auto" onClick={() => setShowDelete(true)}>
            Deletar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Título</label>
              <Input name="title" value={formData.title} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Slug</label>
                <Input name="slug" value={formData.slug} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Preço</label>
                <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Categoria</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1">
                  <option value="">Selecionar Categoria</option>
                  <option value="Gadgets">Gadgets</option>
                  <option value="Beleza">Beleza</option>
                  <option value="Casa">Casa</option>
                  <option value="Coleções">Coleções</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1">
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400">Descrição</label>
              <Textarea name="description" value={formData.description} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white h-32" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400">URL da Imagem</label>
              <Input name="image_url" value={formData.image_url} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            {isEdit ? 'Atualizar Oferta' : 'Criar Oferta'}
          </Button>
        </form>

        {/* Live Preview */}
        <div className="hidden lg:block">
           <div className="sticky top-6">
             <h3 className="text-gray-500 mb-4 text-sm font-semibold uppercase tracking-wider">Prévia</h3>
             <div className="w-[350px] mx-auto bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
               <div className="h-48 bg-gray-900 relative">
                 {formData.image_url ? (
                   <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-700">Sem Imagem</div>
                 )}
               </div>
               <div className="p-4">
                 <h4 className="text-white font-bold text-lg mb-2">{formData.title || 'Título da Oferta'}</h4>
                 <p className="text-orange-500 font-bold text-xl mb-4">
                   {formData.price ? `R$ ${formData.price}` : 'R$ 0,00'}
                 </p>
                 <Button className="w-full bg-orange-600 text-white">Ver Achado</Button>
               </div>
             </div>
           </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showDelete} 
        onClose={() => setShowDelete(false)} 
        onConfirm={handleDelete}
        title="Deletar Oferta"
        message="Deseja permanentemente remover esta oferta?"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminOfferForm;
