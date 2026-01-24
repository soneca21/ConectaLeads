
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, MessageCircle, Star, ShieldCheck, Truck, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import OfferCard from '@/components/public/OfferCard';

const OfferDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [offer, setOffer] = useState(null);
  const [relatedOffers, setRelatedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferData = async () => {
      setLoading(true);
      
      // Fetch Main Offer
      const { data: mainOffer } = await supabase
        .from('offers')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (mainOffer) {
        setOffer(mainOffer);
        trackEvent('offer_view', { offer_id: mainOffer.id, slug: mainOffer.slug });

        // Fetch Related Offers
        const { data: related } = await supabase
          .from('offers')
          .select('*')
          .eq('category', mainOffer.category)
          .neq('id', mainOffer.id)
          .limit(4);
          
        setRelatedOffers(related || []);
      }
      setLoading(false);
    };

    fetchOfferData();
  }, [slug]);

  const handleWhatsAppClick = () => {
    if (offer) {
       trackEvent('whatsapp_click', { offer_id: offer.id });
       const message = `Olá! Vi o achado "${offer.title}" no ConectaLeads e quero aproveitar o desconto!`;
       window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copiado!",
      description: "Compartilhe este achado com seus amigos.",
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );
  
  if (!offer) return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Oferta não encontrada</h1>
      <p className="text-gray-400 mb-8">Este achado pode ter expirado ou o link está incorreto.</p>
      <Link to="/">
        <Button className="bg-accent-orange text-white">Voltar para Home</Button>
      </Link>
    </div>
  );

  const originalPrice = offer.price * 1.4;
  const discount = Math.round(((originalPrice - offer.price) / originalPrice) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} className="mr-2" /> Voltar para Achados
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          {/* Product Image */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative overflow-hidden group">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
             <img 
               src={offer.image_url || `https://source.unsplash.com/random/800x600?${offer.category}`}
               alt={offer.title} 
               className="w-full h-full object-contain max-h-[500px] hover:scale-105 transition-transform duration-500"
             />
             {discount > 0 && (
                <div className="absolute top-6 left-6 bg-accent-orange text-white text-lg font-bold px-4 py-2 rounded-lg shadow-xl">
                  {discount}% OFF
                </div>
             )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
               <span className="text-accent-orange bg-accent-orange/10 px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase border border-accent-orange/20">
                 {offer.category}
               </span>
               <button onClick={handleShare} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                 <Share2 size={20} />
               </button>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              {offer.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center gap-1 text-yellow-400">
                 <Star size={18} fill="currentColor" />
                 <Star size={18} fill="currentColor" />
                 <Star size={18} fill="currentColor" />
                 <Star size={18} fill="currentColor" />
                 <Star size={18} fill="currentColor" className="text-yellow-400/30" />
               </div>
               <span className="text-gray-400 text-sm">4.8 (120 avaliações)</span>
            </div>

            <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-xl mb-8">
              <p className="text-sm text-gray-500 mb-1 line-through">De: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}</p>
              <div className="flex items-end gap-3 mb-2">
                 <span className="text-4xl font-bold text-white">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.price)}
                 </span>
                 <span className="text-green-400 text-sm font-medium mb-2">à vista no Pix</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">ou 12x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.price / 10)}</p>
              
              <Button 
                 onClick={handleWhatsAppClick}
                 className="w-full bg-accent-orange hover:bg-[#e05a2b] text-white h-14 text-lg font-bold shadow-lg shadow-accent-orange/20 mb-4 animate-pulse hover:animate-none"
              >
                  <MessageCircle className="mr-2" /> Quero esse achado!
              </Button>
              <p className="text-center text-xs text-gray-500">
                Ao clicar, você será redirecionado para o WhatsApp para garantir a oferta.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-white/5">
                 <ShieldCheck className="text-green-500" size={24} />
                 <div className="text-sm">
                   <p className="font-semibold text-white">Compra Segura</p>
                   <p className="text-gray-500">Garantida pela plataforma</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-white/5">
                 <Truck className="text-accent-orange" size={24} />
                 <div className="text-sm">
                   <p className="font-semibold text-white">Frete Grátis</p>
                   <p className="text-gray-500">Para todo Brasil</p>
                 </div>
               </div>
            </div>

            <div className="prose prose-invert max-w-none text-gray-400">
              <h3 className="text-white text-lg font-bold mb-3">Sobre este produto</h3>
              <p className="leading-relaxed">
                {offer.description || 'Um dos melhores achados da categoria. Qualidade premium, alta durabilidade e excelente custo-benefício. Perfeito para quem busca tecnologia e praticidade no dia a dia.'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedOffers.length > 0 && (
          <section className="pt-10 border-t border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">Pessoas também viram</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {relatedOffers.map((item, idx) => (
                 <OfferCard key={item.id} offer={item} index={idx} />
               ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OfferDetail;
