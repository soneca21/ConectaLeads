import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import OfferCard from '@/components/public/OfferCard';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/contexts/LocalizationContext';
import { fetchCategories } from '@/lib/catalog';
import { CATEGORIES } from '@/config/constants';

const CategoryPage = () => {
  const { slug } = useParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState({ column: 'created_at', ascending: false });
  const [categoryList, setCategoryList] = useState([]);
  const pageSize = 9;
  const { t } = useLocalization();

  useEffect(() => {
    setLoading(true);
    const fallback = CATEGORIES.find((c) => c.slug === slug || c.key === slug);
    const queryCategory = fallback?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

    const from = page * pageSize;
    const to = from + pageSize - 1;
    supabase
      .from('offers')
      .select('*', { count: 'exact' })
      .eq('category', queryCategory)
      .order(order.column, { ascending: order.ascending })
      .range(from, to)
      .then(({ data, count }) => {
        setOffers(data || []);
        setTotal(count || 0);
        setLoading(false);
      });

    fetchCategories()
      .then((cats) => {
        const cat = cats.find((c) => c.slug === slug);
        if (cat) setSelectedCategory(cat.name);
        else if (fallback) setSelectedCategory(fallback.name);
        setCategoryList(cats || []);
      })
      .catch(() => {
        if (fallback) setSelectedCategory(fallback.name);
      });
  }, [slug, page, order]);

  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const meetsMin = minPrice ? Number(offer.price) >= Number(minPrice) : true;
      const meetsMax = maxPrice ? Number(offer.price) <= Number(maxPrice) : true;
      return meetsMin && meetsMax;
    });
  }, [offers, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-sans">
      <Helmet>
        <title>{selectedCategory || slug} | ConectaLeads</title>
        <meta name="description" content={`Ofertas curadas da categoria ${selectedCategory || slug}.`} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="mb-4 text-sm text-gray-400 flex items-center gap-2">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="hover:text-white transition-colors">Categoria</span>
          <span>/</span>
          <span className="text-white font-medium">{selectedCategory || slug}</span>
        </div>
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold capitalize">Categoria: {selectedCategory || slug}</h1>
            <p className="text-gray-500 text-sm">Use filtros para encontrar o produto ideal.</p>
          </div>
          <Link to="/">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">{t('min_price', 'Preço mín.')}</p>
            <Input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" className="bg-[#0a0a0a] border-white/10 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">{t('max_price', 'Preço máx.')}</p>
            <Input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" className="bg-[#0a0a0a] border-white/10 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Categoria</p>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newSlug = (categoryList.find((c) => c.name === e.target.value) || {}).slug;
                if (newSlug) window.location.href = `/category/${newSlug}`;
              }}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1"
            >
              <option value="">{selectedCategory || slug}</option>
              {categoryList.map((c) => (
                <option key={c.slug || c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Ordenar por</p>
            <select
              value={`${order.column}-${order.ascending ? 'asc' : 'desc'}`}
              onChange={(e) => {
                const [col, dir] = e.target.value.split('-');
                setOrder({ column: col, ascending: dir === 'asc' });
                setPage(0);
              }}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm h-10 mt-1"
            >
              <option value="created_at-desc">Mais recentes</option>
              <option value="created_at-asc">Mais antigos</option>
              <option value="price-asc">Preço: menor</option>
              <option value="price-desc">Preço: maior</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full h-10 border-white/20 text-white">
              {t('apply_filters', 'Aplicar filtros')}
            </Button>
          </div>
          <div className="flex items-end">
            <p className="text-xs text-gray-500">
              Página {page + 1} de {Math.max(1, Math.ceil((total || 0) / pageSize))}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-96 bg-[#1a1a1a] rounded-xl animate-pulse"></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhum achado nesta categoria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((offer, idx) => <OfferCard key={offer.id} offer={offer} index={idx} />)}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Página {page + 1} de {Math.max(1, Math.ceil((total || 0) / pageSize))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-white/20 text-white"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white"
              disabled={(page + 1) * pageSize >= (total || 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
