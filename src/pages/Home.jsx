import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  Smartphone,
  Sparkles,
  Home as HomeIcon,
  Package,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import CategoryCard from '@/components/public/CategoryCard';
import OfferCard from '@/components/public/OfferCard';
import CollectionCard from '@/components/public/CollectionCard';
import { useLocalization } from '@/contexts/LocalizationContext';
import { fetchCategories } from '@/lib/catalog';

const Home = () => {
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState({ column: 'created_at', ascending: false });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const pageSize = 6;
  const { t } = useLocalization();

  const collections = useMemo(
    () => [
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
    ],
    []
  );

  useEffect(() => {
    trackEvent('page_view', { page: 'home' });

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const { data, count, error } = await supabase
          .from('offers')
          .select('*', { count: 'exact' })
          .order(order.column, { ascending: order.ascending })
          .range(from, to);

        if (error) throw error;
        if (data) setFeaturedOffers(data);
        setTotal(count || 0);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [page, order]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      const cats = await fetchCategories();
      setCategories(
        (cats || []).map((c, idx) => ({
          title: c.name,
          description: c.description || 'Curadoria exclusiva.',
          icon: [Smartphone, Sparkles, HomeIcon, Package][idx % 4],
          color: ['blue', 'pink', 'green', 'purple'][idx % 4],
          path: `/category/${c.slug || c.name?.toLowerCase()}`
        }))
      );
      setLoadingCategories(false);
    };
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-sans">
      <Helmet>
        <title>ConectaLeads | {t('weekly_deals', 'Achados da Semana')}</title>
        <meta name="description" content={t('seo_default_desc')} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.origin : ''} />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f2d] via-[#0f121a] to-[#0a0c10]" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[520px] bg-[radial-gradient(circle_at_top,rgba(255,115,29,0.25),transparent_45%)]" />
        <div className="absolute top-28 -left-20 w-80 h-80 bg-category-blue/20 blur-[120px]" />
        <div className="absolute bottom-10 -right-10 w-96 h-96 bg-accent-orange/25 blur-[140px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/15 text-accent-orange border border-accent-orange/20 text-sm font-semibold mb-6">
                <Sparkles size={16} />
                <span>Curadoria diária de gadgets & tech</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                {t('hero_headline', 'Os melhores achados de')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange via-yellow-400 to-red-500">
                  Gadgets & Tech
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
                {t(
                  'hero_subheadline',
                  'Tecnologia selecionada com preços inteligentes, frete rápido e confiança para você comprar sem dúvidas.'
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-accent-orange hover:bg-[#e05a2b] text-white font-semibold text-lg shadow-lg shadow-accent-orange/25 w-full sm:w-auto"
                >
                  {t('weekly_deals', 'Achados da Semana')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  {t('explore_categories', 'Explorar categorias')} <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap gap-6 text-sm text-gray-400">
                {[
                  { label: 'Curadoria diária', icon: CheckCircle },
                  { label: 'Lojas confiáveis', icon: Shield },
                  { label: 'Entrega Brasil', icon: Zap }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="bg-green-500/10 p-1.5 rounded-full">
                      <item.icon size={14} className="text-green-400" />
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="md:col-span-2"
            >
              <div className="relative rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
                <div className="absolute -top-6 right-6 bg-gradient-to-br from-accent-orange to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  +3 hoje
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {featuredOffers.slice(0, 4).map((offer) => (
                    <div
                      key={offer.id}
                      className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#0c0f16]"
                    >
                      <img
                        src={offer.image_url || 'https://source.unsplash.com/random/400x400?tech'}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {featuredOffers.length === 0 && (
                    <>
                      {[1, 2, 3, 4].map((idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                        />
                      ))}
                    </>
                  )}
                </div>
                <div className="mt-5 text-sm text-gray-300">
                  Ofertas verificadas manualmente e atualizadas todos os dias para você economizar tempo.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-18 md:py-20 bg-[#0e121b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Explore por Categoria</h2>
            <p className="text-gray-400">
              Produtos selecionados e organizados para você encontrar exatamente o que precisa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCategories
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                ))
              : categories.map((category, idx) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    whileHover={{ y: -6 }}
                  >
                    <CategoryCard
                      title={category.title}
                      description={category.description}
                      icon={category.icon}
                      color={category.color}
                      path={category.path}
                      index={idx}
                    />
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-bold uppercase">
                Novidades
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white">Achados da Semana</h2>
            <p className="text-sm text-gray-400 mt-1">Últimos 6 produtos adicionados à curadoria.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={`${order.column}-${order.ascending ? 'asc' : 'desc'}`}
              onChange={(e) => {
                const [col, dir] = e.target.value.split('-');
                setOrder({ column: col, ascending: dir === 'asc' });
                setPage(0);
              }}
              className="bg-[#0b0d13] border border-white/10 text-sm text-white rounded-lg px-3 py-2"
            >
              <option value="created_at-desc">Mais recentes</option>
              <option value="created_at-asc">Mais antigos</option>
              <option value="price-asc">Preço: menor</option>
              <option value="price-desc">Preço: maior</option>
            </select>
            <Button variant="outline" className="hidden sm:flex border-white/20 hover:bg-white/10 text-white">
              {t('see_all', 'Ver todos')} <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-[#10131b] p-4 space-y-4 animate-pulse"
              >
                <div className="h-48 rounded-xl bg-white/10" />
                <div className="h-4 w-2/3 bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
                <div className="h-10 rounded-lg bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOffers.map((offer, idx) => (
              <OfferCard key={offer.id} offer={offer} index={idx} />
            ))}
            {featuredOffers.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500">
                Nenhum achado disponível no momento.
              </div>
            )}
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
      </section>

      {/* Collections */}
      <section className="py-20 bg-[#0e121b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Coleções Especiais</h2>
            <p className="text-gray-400">Listas curadas para diferentes necessidades e orçamentos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.title}
                title={collection.title}
                count={collection.count}
                image={collection.image}
                path={collection.path}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
