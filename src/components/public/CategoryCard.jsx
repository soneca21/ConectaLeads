
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ title, description, icon: Icon, color, path, index }) => {
  const colorMap = {
    blue: 'bg-category-blue',
    pink: 'bg-category-pink',
    green: 'bg-category-green',
    purple: 'bg-category-purple',
  };

  const bgColor = colorMap[color] || 'bg-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-2xl bg-[#1a1a1a] p-6 border border-white/5 hover:border-white/10 transition-all"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20`} />
      
      <div className={`w-12 h-12 rounded-xl ${bgColor} bg-opacity-20 flex items-center justify-center mb-4 text-white`}>
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 line-clamp-2">{description}</p>

      <Link 
        to={path} 
        className="inline-flex items-center text-sm font-medium text-white hover:text-accent-orange transition-colors"
      >
        Explorar <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
