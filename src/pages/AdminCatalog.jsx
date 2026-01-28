import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchCategories, fetchTags, upsertCategory, upsertTag } from '@/lib/catalog';

const AdminCatalog = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image_url: '' });
  const [tagForm, setTagForm] = useState({ name: '', slug: '' });
  const { toast } = useToast();

  const load = async () => {
    setCategories(await fetchCategories());
    setTags(await fetchTags());
  };

  useEffect(() => {
    load();
  }, []);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...categoryForm,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };
      const { error } = await upsertCategory(payload);
      if (error) throw error;
      toast({ title: 'Categoria salva' });
      setCategoryForm({ name: '', slug: '', description: '', image_url: '' });
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message });
    }
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...tagForm,
        slug: tagForm.slug || tagForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };
      const { error } = await upsertTag(payload);
      if (error) throw error;
      toast({ title: 'Tag salva' });
      setTagForm({ name: '', slug: '' });
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-white">Catálogo • Categorias & Tags</h1>
        <Button variant="ghost" size="icon" onClick={load} className="text-gray-400 hover:text-white">
          <RefreshCcw size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCategorySubmit} className="space-y-3">
              <Input placeholder="Nome" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" />
              <Input placeholder="Slug (opcional)" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" />
              <Textarea placeholder="Descrição" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" />
              <Input placeholder="Imagem da categoria (URL)" value={categoryForm.image_url} onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" />
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700"><Plus size={14} className="mr-2" />Salvar Categoria</Button>
            </form>

            <div className="divide-y divide-white/5 border-t border-white/5">
              {categories.map((cat) => (
                <div key={cat.slug || cat.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{cat.slug}</span>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-gray-500 py-3">Nenhuma categoria cadastrada.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleTagSubmit} className="space-y-3">
              <Input placeholder="Nome da tag" value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" />
              <Input placeholder="Slug (opcional)" value={tagForm.slug} onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" />
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700"><Plus size={14} className="mr-2" />Salvar Tag</Button>
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {tags.map((tag) => (
                <span key={tag.slug || tag.id} className="px-3 py-2 bg-white/5 rounded text-sm text-white border border-white/10">
                  {tag.name}
                </span>
              ))}
              {tags.length === 0 && <p className="text-sm text-gray-500">Nenhuma tag cadastrada.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCatalog;

