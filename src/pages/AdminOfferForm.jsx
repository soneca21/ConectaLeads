import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Tag as TagIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { fetchCategories, fetchTags } from '@/lib/catalog';
import { CATEGORIES } from '@/config/constants';
import { useLocalization } from '@/contexts/LocalizationContext';
import { generateSlug } from '@/utils/slug';

const EMPTY_FORM = {
  title: '',
  slug: '',
  price: '',
  price_original: '',
  discount_percentage: '',
  currency: 'BRL',
  category: '',
  tags: [],
  shopee_url: '',
  image_url: '',
  video_url: '',
  images: [],
  description: '',
  whatsapp_cta_text: 'Quero esse achado!',
  status: 'draft'
};

const AdminOfferForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useLocalization();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [showDelete, setShowDelete] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [slugError, setSlugError] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats && cats.length ? cats : CATEGORIES))
      .catch(() => setCategories(CATEGORIES));
    fetchTags().then(setAvailableTags);
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchOffer();
    }
  }, [id]);

  const fetchOffer = async () => {
    const { data } = await supabase.from('offers').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        ...EMPTY_FORM,
        ...data,
        tags: data.tags || [],
        images: data.images || [],
        currency: data.currency || 'BRL'
      });
      setGalleryInput((data.images || []).join('\n'));
      setOriginalPrice(data.price);
    }
    setInitialLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') setSlugError('');
    setFormData(prev => {
      const updates = { ...prev, [name]: value };
      if (name === 'title' && !isEdit) {
        updates.slug = generateSlug(value);
        setSlugError('');
      }
      return updates;
    });
  };

  const suggestSlug = (base) => {
    const normalized = base || 'oferta';
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${normalized}-${suffix}`;
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setFormData(prev => ({ ...prev, tags: Array.from(new Set([...(prev.tags || []), tagInput.trim()])) }));
    setTagInput('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
      const filePath = `offers/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage.from('offers').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('offers').getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: 'Imagem enviada', description: 'Link atualizado no formulário.' });
    } catch (error) {
      console.error(error);
      setUploadError(error.message || 'Falha ao enviar imagem.');
      toast({ variant: 'destructive', title: 'Erro no upload', description: error.message || 'Falha ao enviar imagem.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadError('');
    setGalleryUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
        const filePath = `offers/gallery-${Date.now()}-${sanitizedName}`;
        const { error: uploadErr } = await supabase.storage.from('offers').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (uploadErr) throw uploadErr;
        const { data: publicUrlData } = supabase.storage.from('offers').getPublicUrl(filePath);
        const publicUrl = publicUrlData?.publicUrl;
        if (publicUrl) uploadedUrls.push(publicUrl);
      }
      const merged = [...galleryInput.split('\n').filter(Boolean), ...uploadedUrls];
      setGalleryInput(merged.join('\n'));
      toast({ title: 'Imagens adicionadas', description: `${uploadedUrls.length} imagens incluídas na galeria.` });
    } catch (error) {
      console.error(error);
      setUploadError(error.message || 'Falha ao enviar imagens.');
      toast({ variant: 'destructive', title: 'Erro no upload', description: error.message || 'Falha ao enviar imagens.' });
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast({ variant: "destructive", title: "Erro", description: "Título e Slug são obrigatórios" });
      return;
    }

    const unique = await checkSlugUnique(formData.slug);
    if (!unique) return;

    setLoading(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      price_original: formData.price_original ? parseFloat(formData.price_original) : null,
      discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
      tags: formData.tags,
      video_url: formData.video_url,
      images: galleryInput.split('\n').filter(Boolean),
      updated_at: new Date().toISOString()
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from('offers').update(payload).eq('id', id);
        if (error) throw error;
        if (originalPrice && originalPrice !== payload.price) {
          await supabase.from('price_history').insert([{ offer_id: id, price: payload.price, currency: payload.currency }]);
        }
      } else {
        const { data, error } = await supabase.from('offers').insert([{ ...payload, created_at: new Date().toISOString() }]).select().single();
        if (error) throw error;
        if (data?.id) {
          await supabase.from('price_history').insert([{ offer_id: data.id, price: payload.price, currency: payload.currency }]);
        }
      }

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

  const checkSlugUnique = async (slugValue) => {
    if (!slugValue) return false;
    setCheckingSlug(true);
    try {
      let query = supabase.from('offers').select('id').eq('slug', slugValue);
      if (isEdit) query = query.neq('id', id);
      const { data, error } = await query.limit(1);
      if (error) throw error;
      const exists = data && data.length > 0;
      if (exists) {
        const suggestion = suggestSlug(slugValue);
        setSlugError(`Slug já existe. Sugestão: ${suggestion}`);
        toast({ variant: 'destructive', title: 'Slug indisponível', description: 'Escolha outro slug.' });
        return false;
      }
      setSlugError('');
      return true;
    } catch (err) {
      setSlugError(err.message || 'Erro ao verificar slug');
      toast({ variant: 'destructive', title: 'Erro', description: err.message || 'Falha ao checar slug.' });
      return false;
    } finally {
      setCheckingSlug(false);
    }
  };

  const formattedPreviewPrice = useMemo(() => {
    if (!formData.price) return formatPrice(0);
    return formatPrice(formData.price, { from: formData.currency });
  }, [formData.price, formData.currency, formatPrice]);

  if (initialLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

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
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  onBlur={(e) => checkSlugUnique(e.target.value)}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                />
                {slugError && <p className="text-xs text-red-400 mt-1">{slugError}</p>}
                {checkingSlug && <p className="text-xs text-gray-500 mt-1">Verificando disponibilidade...</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Preço</label>
                <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Moeda</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1">
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1">
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Preço Original</label>
                <Input
                  name="price_original"
                  type="number"
                  step="0.01"
                  value={formData.price_original}
                  onChange={handleChange}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                  placeholder="Preço antes do desconto"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">% Desconto</label>
                <Input
                  name="discount_percentage"
                  type="number"
                  step="1"
                  value={formData.discount_percentage}
                  onChange={handleChange}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                  placeholder="Ex: 25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Categoria</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1">
                  <option value="">Selecionar Categoria</option>
                  {categories.map(cat => (
                    <option key={cat.slug || cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">Tags <TagIcon size={14} /></label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="tech, casa, beleza" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}><Plus size={14} /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.tags || []).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-200 border border-white/10">
                      {tag}
                    </span>
                  ))}
                  {formData.tags?.length === 0 && <span className="text-xs text-gray-500">Sem tags</span>}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400">Descrição</label>
              <Textarea name="description" value={formData.description} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white h-32" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">URL da Imagem Principal</label>
                <div className="flex gap-2">
                  <Input
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                    placeholder="https://..."
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                  </Button>
                </div>
                {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">URL Afiliado Shopee</label>
                <Input name="shopee_url" value={formData.shopee_url} onChange={handleChange} placeholder="https://shopee.com/... (link afiliado)" className="bg-[#0a0a0a] border-white/10 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Vídeo demonstrativo (URL)</label>
                <Input
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                  placeholder="https://youtu.be/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Upload para galeria</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={galleryInputRef}
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => galleryInputRef.current?.click()} disabled={galleryUploading}>
                    {galleryUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar imagens'}
                  </Button>
                  {galleryUploading && <span className="text-xs text-gray-400">Enviando...</span>}
                </div>
              </div>
            </div>

            {formData.image_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Pré-visualização</p>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-2">
                  <img src={formData.image_url} alt="Pré-visualização" className="max-h-48 object-contain mx-auto" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-400">Galeria (um link por linha)</label>
              <Textarea value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} className="bg-[#0a0a0a] border-white/10 text-white h-24" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400">Texto do CTA WhatsApp</label>
              <Input name="whatsapp_cta_text" value={formData.whatsapp_cta_text} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white" />
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
                 <p className="text-orange-500 font-bold text-xl mb-1">
                   {formattedPreviewPrice}
                 </p>
                 <p className="text-xs text-gray-400 mb-4">{formData.category || 'Categoria'}</p>
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
