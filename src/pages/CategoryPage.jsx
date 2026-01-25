import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import OfferCard from '@/components/public/OfferCard';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';

const CategoryPage = () => {
  const { slug } = useParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('offers')
      .select('*')
      .eq('category', slug.charAt(0).toUpperCase() + slug.slice(1))
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOffers(data || []);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-sans">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold capitalize">Categoria: {slug}</h1>
          <Link to="/">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-96 bg-[#1a1a1a] rounded-xl animate-pulse"></div>)}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhum achado nesta categoria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer, idx) => <OfferCard key={offer.id} offer={offer} index={idx} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
