import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft,
  MessageCircle,
  Star,
  ShieldCheck,
  Truck,
  Share2,
  ShoppingBag,
  HelpCircle,
  Clock3,
  Copy
} from 'lucide-react';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import OfferCard from '@/components/public/OfferCard';
import { fetchFaqs, fetchPriceHistory, fetchReviews } from '@/lib/catalog';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useToast } from '@/components/ui/use-toast';
import { ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';

const OfferDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { formatPrice, t } = useLocalization();

  const [offer, setOffer] = useState(null);
  const [relatedOffers, setRelatedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999');
  const [activeImage, setActiveImage] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchOfferData = async () => {
      setLoading(true);

      const { data: mainOffer } = await supabase.from('offers').select('*').eq('slug', slug).single();

      if (mainOffer) {
        setOffer(mainOffer);
        trackEvent('product_view', { offer_id: mainOffer.id, slug: mainOffer.slug, price: mainOffer.price });

        const [related, history, fetchedReviews, fetchedFaqs] = await Promise.all([
          supabase.from('offers').select('*').eq('category', mainOffer.category).neq('id', mainOffer.id).limit(4),
          fetchPriceHistory(mainOffer.id),
          fetchReviews(mainOffer.id),
          fetchFaqs(mainOffer.id)
        ]);

        setRelatedOffers(related.data || []);
        setPriceHistory(history);
        setReviews(fetchedReviews);
        setFaqs(fetchedFaqs);
      }
      setLoading(false);
    };

    const fetchWhatsapp = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').limit(1);
      const value = Array.isArray(data) ? data[0]?.value : data?.value;
      if (value) setWhatsappNumber(String(value).replace(/\D/g, '') || '5511999999999');
    };

    fetchOfferData();
    fetchWhatsapp();
  }, [slug]);

  const handleWhatsAppClick = () => {
    if (!offer) return;
    trackEvent('whatsapp_click', { offer_id: offer.id });
    const message = `Olá! Vi o achado "${offer.title}" no ConectaLeads e quero aproveitar o desconto!`;
    window.open(`https://wa.me/${whatsappNumber || '5511999999999'}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShopeeClick = () => {
    if (!offer?.shopee_url) {
      toast({ variant: 'destructive', title: 'Link indisponível', description: 'Este produto ainda não tem link.' });
      return;
    }
    trackEvent('purchase_click', { offer_id: offer.id, destination: 'shopee' });
    window.open(offer.shopee_url, '_blank', 'noopener');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copiado!', description: 'Compartilhe este achado com seus amigos.' });
  };

  const originalPrice = Number(offer?.price_original) || (offer?.price ? Number(offer.price) * 1.2 : 0);
  const computedDiscount =
    originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - Number(offer?.price || 0)) / originalPrice) * 100)) : null;
  const discount = Number.isFinite(Number(offer?.discount_percentage)) ? Number(offer.discount_percentage) : computedDiscount;
  const savings = originalPrice && offer?.price ? originalPrice - offer.price : 0;

  const galleryImages = useMemo(() => {
    if (offer?.images?.length) return offer.images;
    if (offer?.image_url) return [offer.image_url];
    return [`https://source.unsplash.com/random/800x600?${offer?.category || 'tech'}`];
  }, [offer]);

  const promoEndsAt = useMemo(() => {
    const base = new Date();
    base.setHours(base.getHours() + 6);
    return base;
  }, [offer?.id]);

  const formatCountdown = () => {
    const diff = promoEndsAt.getTime() - Date.now();
    if (diff <= 0) return 'termina em instantes';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `termina em ${hours}h ${minutes}m`;
  };

  const displayedFaqs =
    faqs.length > 0
      ? faqs
      : [
          { question: 'Como funciona a entrega?', answer: 'Enviamos via Shopee com rastreio e prazos médios de 5 a 12 dias úteis.' },
          { question: 'O preço muda com frequência?', answer: 'Monitoramos as variações e exibimos o histórico de preço abaixo.' },
          { question: 'O produto tem garantia?', answer: 'Sim, garantia oficial do fabricante ou da loja parceira.' }
        ];

  const sampleReviews = [
    { author: 'Ana', rating: 5, comment: 'Chegou rápido e o custo-benefício é ótimo.' },
    { author: 'João', rating: 4, comment: 'Produto honesto, recomendo para uso diário.' },
    { author: 'Luiza', rating: 5, comment: 'Design lindo e funciona perfeitamente com meu setup.' }
  ];

  const reviewsToShow = reviews.length ? reviews : sampleReviews;
  const averageRating = useMemo(() => {
    if (!reviewsToShow.length) return 5;
    const total = reviewsToShow.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return (total / reviewsToShow.length).toFixed(1);
  }, [reviewsToShow]);

  const productJsonLd = useMemo(() => {
    if (!offer) return null;
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: offer.title,
      image: galleryImages,
      description:
        offer.description ||
        'Oferta curada pela ConectaLeads com frete grátis e garantia de compra segura.',
      sku: offer.slug,
      brand: offer.brand || 'ConectaLeads',
      offers: {
        '@type': 'Offer',
        priceCurrency: offer.currency || 'BRL',
        price: Number(offer.price) || 0,
        availability: 'https://schema.org/InStock',
        url: typeof window !== 'undefined' ? window.location.href : ''
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(averageRating) || 5,
        reviewCount: reviewsToShow.length || 1
      }
    };
  }, [offer, galleryImages, averageRating, reviewsToShow]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Oferta não encontrada</h1>
        <p className="text-gray-400 mb-8">Este achado pode ter expirado ou o link está incorreto.</p>
        <Link to="/">
          <Button className="bg-accent-orange text-white">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  const chartData = (priceHistory.length
    ? priceHistory
    : [{ price: offer.price, recorded_at: offer.updated_at || offer.created_at, currency: offer.currency || 'BRL' }])
    .map((item) => ({
      date: new Date(item.recorded_at || item.created_at || new Date()).toLocaleDateString(),
      price: Number(item.price || offer.price)
    }));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-sans">
      <Helmet>
        <title>{offer.title} | ConectaLeads</title>
        <meta name="description" content={offer.description?.slice(0, 150) || t('seo_default_desc')} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:title" content={`${offer.title} | ConectaLeads`} />
        <meta property="og:description" content={offer.description?.slice(0, 150) || t('seo_default_desc')} />
        <meta property="og:image" content={galleryImages?.[0]} />
        <meta property="og:type" content="product" />
        {productJsonLd && (
          <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        )}
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to={`/category/${(offer.category || '').toLowerCase()}`} className="hover:text-white transition-colors">
              {offer.category || 'Categoria'}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{offer.title}</span>
          </div>
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 min-h-[400px] lg:min-h-[520px] relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              <img
                src={galleryImages[activeImage]}
                alt={offer.title}
                className="w-full h-full object-contain max-h-[500px] transition-transform duration-500 hover:scale-105"
              />
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-accent-orange text-white text-lg font-bold px-4 py-2 rounded-lg shadow-xl">
                  -{discount}%
                </div>
              )}
              <div className="absolute top-6 right-6 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white border border-white/10">
                <Clock3 size={12} className="inline mr-1" />
                {formatCountdown()}
              </div>
            </div>

            {offer.video_url && (
              <div className="bg-[#0f121b] border border-white/5 rounded-xl p-3">
                <p className="text-sm text-gray-300 mb-2">Vídeo demonstrativo</p>
                <video src={offer.video_url} controls className="w-full rounded-lg border border-white/5" />
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  className={`relative h-20 w-28 rounded-lg border ${
                    idx === activeImage ? 'border-accent-orange' : 'border-white/10'
                  } overflow-hidden`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-accent-orange bg-accent-orange/10 px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase border border-accent-orange/20">
                {offer.category}
              </span>
              <button
                onClick={() => setShowShare(true)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">{offer.title}</h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={18}
                    fill="currentColor"
                    className={idx < Math.round(averageRating) ? 'text-yellow-400' : 'text-yellow-400/30'}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {averageRating} ({reviewsToShow.length} {t('reviews_title', 'avaliações')})
              </span>
            </div>

            <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-xl mb-8">
              {discount ? (
                <p className="text-sm text-gray-500 mb-1 line-through">De: {formatPrice(originalPrice, { from: offer.currency || 'BRL' })}</p>
              ) : null}
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-white">{formatPrice(offer.price, { from: offer.currency || 'BRL' })}</span>
                {discount ? <span className="text-green-400 text-sm font-medium mb-2">{discount}% OFF</span> : null}
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-400 font-semibold">
                  Você economiza {formatPrice(savings, { from: offer.currency || 'BRL' })} ({discount}%)
                </p>
              )}
              <p className="text-sm text-gray-400 mb-6">
                ou 12x de {formatPrice((offer.price || 0) / 10, { from: offer.currency || 'BRL' })}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleShopeeClick}
                  className="w-full bg-accent-orange hover:bg-[#e05a2b] text-white h-12 text-lg font-bold shadow-lg shadow-accent-orange/20"
                >
                  <ShoppingBag className="mr-2" /> {t('buy_now', 'Comprar na Shopee')}
                </Button>
                <Button
                  onClick={handleWhatsAppClick}
                  variant="outline"
                  className="w-full border-white/20 text-white h-12 text-lg font-bold"
                >
                  <MessageCircle className="mr-2" /> {t('whatsapp_cta', 'Falar no WhatsApp')}
                </Button>
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">Ao clicar, você será redirecionado para a Shopee ou WhatsApp.</p>
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
                {offer.description ||
                  'Um dos melhores achados da categoria. Qualidade premium, alta durabilidade e excelente custo-benefício. Perfeito para quem busca tecnologia e praticidade no dia a dia.'}
              </p>
            </div>
          </div>
        </div>

        {/* Price history */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{t('price_history', 'Histórico de preço')}</h2>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#777" />
                <YAxis stroke="#777" />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={20} className="text-accent-orange" />
            <h2 className="text-2xl font-bold">{t('faq_title', 'Perguntas frequentes')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedFaqs.map((faq, idx) => (
              <div key={idx} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">{faq.question}</p>
                <p className="text-gray-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">{t('reviews_title', 'Avaliações')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviewsToShow.map((review, idx) => (
              <div key={idx} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-orange/20 text-accent-orange flex items-center justify-center font-bold uppercase">
                    {review.author?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{review.author || 'Cliente'}</p>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          fill="currentColor"
                          className={starIdx < (review.rating || 5) ? 'text-yellow-400' : 'text-yellow-400/30'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {relatedOffers.length > 0 && (
          <section className="pt-10 border-t border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">{t('related_products', 'Pessoas também viram')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedOffers.map((item, idx) => (
                <OfferCard key={item.id} offer={item} index={idx} />
              ))}
            </div>
          </section>
        )}
      </main>

      {showShare && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f1118] border border-white/10 rounded-2xl p-6 w-full max-w-md relative">
            <button className="absolute right-3 top-3 text-gray-400 hover:text-white" onClick={() => setShowShare(false)}>
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">Compartilhar achado</h3>
            <div className="space-y-3">
              <Button
                className="w-full bg-[#25D366] text-white hover:bg-[#1ebe59]"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                WhatsApp
              </Button>
              <Button
                className="w-full bg-[#2AABEE] text-white hover:bg-[#1f98d6]"
                onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                Telegram
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white"
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(offer.title)}&body=${encodeURIComponent(window.location.href)}`)}
              >
                Email
              </Button>
              <div className="flex gap-2">
                <InputReadOnly value={window.location.href} />
                <Button variant="outline" onClick={handleCopyLink}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const InputReadOnly = ({ value }) => (
  <div className="flex-1 bg-[#0b0d13] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 truncate">{value}</div>
);

export default OfferDetail;
