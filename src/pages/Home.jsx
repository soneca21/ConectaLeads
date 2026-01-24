
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Sparkles, Home as HomeIcon, Package, ArrowRight, CheckCircle } from 'lucide-react';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import CategoryCard from '@/components/public/CategoryCard';
import OfferCard from '@/components/public/OfferCard';
import CollectionCard from '@/components/public/CollectionCard';

const Home = () => {
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', { page: 'home' });
    
    const fetchOffers = async () => {
      try {
        const { data } = await supabase
          .from('offers')
          .select('*')
          .limit(6)
          .order('created_at', { ascending: false });
        
        if (data) setFeaturedOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent-orange rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-category-blue rounded-full blur-[128px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/10 text-accent-orange border border-accent-orange/20 text-sm font-medium mb-8">
              <Sparkles size={16} />
              <span>3 achados verificados hoje</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Os melhores achados de <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-red-500">
                Gadgets & Tech
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Curadoria diária de gadgets, beleza e utilidades domésticas com os melhores preços.
              Prós, contras e tudo que você precisa saber antes de comprar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 bg-accent-orange hover:bg-[#e05a2b] text-white font-semibold text-lg shadow-lg shadow-accent-orange/20 w-full sm:w-auto">
                Ver Achados da Semana
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                Explorar Categorias <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
               <div className="flex items-center gap-2">
                 <div className="bg-green-500/10 p-1 rounded-full"><CheckCircle size={14} className="text-green-500" /></div>
                 Curadoria diária
               </div>
               <div className="flex items-center gap-2">
                 <div className="bg-green-500/10 p-1 rounded-full"><CheckCircle size={14} className="text-green-500" /></div>
                 Lojas confiáveis
               </div>
               <div className="flex items-center gap-2">
                 <div className="bg-green-500/10 p-1 rounded-full"><CheckCircle size={14} className="text-green-500" /></div>
                 Envio Brasil
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Explore por Categoria</h2>
            <p className="text-gray-400">Produtos selecionados e organizados para você encontrar exatamente o que precisa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard 
              title="Gadgets" 
              description="Tecnologia, acessórios e smart home." 
              icon={Smartphone} 
              color="blue" 
              path="/category/gadgets"
              index={0}
            />
            <CategoryCard 
              title="Beleza" 
              description="Skincare, maquiagem e cuidados pessoais." 
              icon={Sparkles} 
              color="pink" 
              path="/category/beauty"
              index={1}
            />
            <CategoryCard 
              title="Casa" 
              description="Utilidades domésticas e decoração." 
              icon={HomeIcon} 
              color="green" 
              path="/category/home"
              index={2}
            />
            <CategoryCard 
              title="Coleções" 
              description="Seleções temáticas especiais." 
              icon={Package} 
              color="purple" 
              path="/collections"
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-bold uppercase">Novidades</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Achados da Semana</h2>
          </div>
          <Button variant="outline" className="hidden sm:flex border-white/20 hover:bg-white/10 text-white">
            Ver todos <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-96 bg-[#1a1a1a] rounded-xl animate-pulse"></div>)}
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
        
        <div className="mt-8 text-center sm:hidden">
           <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white w-full">
            Ver todos <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Collections */}
      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Coleções Especiais</h2>
            <p className="text-gray-400">Listas curadas para diferentes necessidades e orçamentos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CollectionCard 
              title="Setup Gamer Minimalista"
              count={12}
              image="https://images.unsplash.com/photo-1593640408182-31c70c8268f5"
              path="/collection/setup-gamer"
            />
            <CollectionCard 
              title="Escritório Home Office"
              count={8}
              image="https://images.unsplash.com/photo-1497215728101-856f4ea42174"
              path="/collection/home-office"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
