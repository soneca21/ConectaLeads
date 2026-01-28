import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/tracking';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/contexts/LocalizationContext';

const OfferCard = ({ offer, index = 0 }) => {
  const { formatPrice, t } = useLocalization();

  const { price, price_original, discount_percentage } = offer || {};
  const computedOriginal = Number(price_original) || (Number(price) && Number(price) * 1.4) || Number(price) || 0;
  const computedDiscount = Number.isFinite(Number(discount_percentage))
    ? Number(discount_percentage)
    : computedOriginal > 0
      ? Math.max(0, Math.round(((computedOriginal - Number(price || 0)) / computedOriginal) * 100))
      : 0;

  const fallbackImg = useMemo(
    () =>
      offer?.image_url ||
      offer?.images?.[0] ||
      offer?.shopee_url ||
      `https://source.unsplash.com/random/800x600?${offer?.category || 'tech'}`,
    [offer]
  );

  const handleClick = () => trackEvent('offer_click', { offer_id: offer?.id });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="bg-[#111319] border border-white/5 rounded-2xl overflow-hidden group hover:border-accent-orange/40 transition-all shadow-lg hover:shadow-accent-orange/15"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        <img
          src={fallbackImg}
          alt={`${offer?.title || 'Oferta'} - ${offer?.category || 'Promo'}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {computedDiscount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-accent-orange to-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            -{computedDiscount}%
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
          {offer?.category || 'Promo'}
        </div>
      </div>

      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2 text-yellow-400">
          <Star size={14} className="fill-yellow-400" />
          <span className="text-xs text-gray-300 font-medium">4,8 • 120 reviews</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[56px] group-hover:text-accent-orange transition-colors">
          {offer?.title}
        </h3>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-end justify-between mb-4">
            <div>
              {computedOriginal > Number(price || 0) && (
                <p className="text-xs text-gray-500 line-through mb-0.5">
                  {formatPrice(computedOriginal, { from: offer?.currency || 'BRL' })}
                </p>
              )}
              <p className="text-2xl font-bold text-white">
                {formatPrice(price || 0, { from: offer?.currency || 'BRL' })}
              </p>
              {computedDiscount > 0 && (
                <p className="text-xs text-green-400 font-semibold">
                  {t('you_save', 'Você economiza')} {formatPrice(computedOriginal - (price || 0), { from: offer?.currency || 'BRL' })} ({computedDiscount}%)
                </p>
              )}
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs text-green-200 bg-green-600/20 px-2 py-1 rounded border border-green-500/40 flex items-center gap-1 justify-end">
                <Truck size={12} /> {t('free_shipping', 'Frete Grátis')}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 justify-end">
                <ShieldCheck size={12} /> {t('secure_purchase', 'Compra Segura')}
              </span>
            </div>
          </div>

          <Link to={`/o/${offer?.slug}`} onClick={handleClick}>
            <Button className="w-full bg-accent-orange hover:bg-[#e05a2b] text-white font-semibold transition-all">
              {t('view_deal', 'Ver Achado')} <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard;
