import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import CollectionCard from '@/components/public/CollectionCard';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/contexts/LocalizationContext';

const fallbackCollections = [
  {
    title: 'Setup Gamer Minimalista',
    count: 12,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
    path: '/collection/setup-gamer'
  },
  {
    title: 'Escritório Home Office',
    count: 8,
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174',
    path: '/collection/home-office'
  },
  {
    title: 'Smart Home Essentials',
    count: 10,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    path: '/collection/smart-home'
  }
];

const Collections = () => {
  const [collections, setCollections] = useState(fallbackCollections);
  const [filter, setFilter] = useState('');
  const { t } = useLocalization();

  useEffect(() => {
    supabase
      .from('collections')
      .select('*')
      .then(({ data }) => {
        if (data && data.length) {
          const mapped = data.map((c) => ({
            title: c.title,
            count: c.count || c.items_count || 0,
            image: c.image,
            path: `/collection/${c.slug || c.id}`
          }));
          setCollections(mapped);
        }
      });
  }, []);

  const filtered = collections.filter(
    (c) => c.title.toLowerCase().includes(filter.toLowerCase()) || c.path.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      <Helmet>
        <title>{t('collections', 'Coleções')} | ConectaLeads</title>
      </Helmet>
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wide">Curadoria</p>
            <h1 className="text-3xl font-bold">Coleções</h1>
            <p className="text-gray-400 text-sm">Agrupamentos temáticos para facilitar sua busca.</p>
          </div>
          <div className="w-64">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar coleções..."
              className="bg-[#0a0a0a] border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((collection) => (
            <CollectionCard
              key={collection.title}
              title={collection.title}
              count={collection.count}
              image={collection.image}
              path={collection.path}
            />
          ))}
          {filtered.length === 0 && <p className="text-gray-500">Nenhuma coleção encontrada.</p>}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
