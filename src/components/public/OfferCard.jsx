
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/tracking';
import { Button } from '@/components/ui/button';

const OfferCard = ({ offer, index = 0 }) => {
  const handleClick = () => {
    trackEvent('offer_click', { offer_id: offer.id });
  };

  // Calculate discount percentage
  const originalPrice = offer.price * 1.4; // Mock original price logic
  const discount = Math.round(((originalPrice - offer.price) / originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden group hover:border-accent-orange/30 transition-all shadow-lg hover:shadow-accent-orange/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        <img 
          src={offer.image_url || offer.shopee_url || `https://source.unsplash.com/random/800x600?${offer.category}`} 
          alt={offer.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-accent-orange text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            {discount}% OFF
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
          {offer.category || 'Promo'}
        </div>
      </div>

      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-1 mb-2">
           <Star size={14} className="text-yellow-400 fill-yellow-400" />
           <span className="text-xs text-gray-300 font-medium">4.8 (120 avaliações)</span>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[56px] group-hover:text-accent-orange transition-colors">
          {offer.title}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 line-through mb-0.5">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
              </p>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.price)}
              </p>
            </div>
            <div className="text-right">
               <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Frete Grátis</span>
            </div>
          </div>
          
          <Link to={`/o/${offer.slug}`} onClick={handleClick}>
            <Button className="w-full bg-accent-orange hover:bg-[#e05a2b] text-white font-semibold transition-all">
               Ver Achado <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard;
