
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CollectionCard = ({ title, count, image, path }) => {
  return (
    <Link to={path} className="block group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative h-64 rounded-2xl overflow-hidden border border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <img 
          src={image} 
          alt={`Coleção ${title}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
          <div className="flex justify-between items-end">
            <div>
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white mb-2 border border-white/10">
                {count} Produtos
              </span>
              <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              aria-label={`Ir para coleção ${title}`}
            >
              <ArrowRight size={20} aria-hidden="true" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CollectionCard;
