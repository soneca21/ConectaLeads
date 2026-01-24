
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Gadgets', path: '/category/gadgets' },
    { label: 'Beleza', path: '/category/beauty' },
    { label: 'Casa', path: '/category/home' },
    { label: 'Coleções', path: '/collections' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#1a1a1a]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1a1a1a]/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-accent-orange p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform">
             <Sparkles size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">
            Conecta<span className="text-accent-orange">Leads</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              to={item.path}
              className="text-sm font-medium text-gray-300 hover:text-accent-orange transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar achados..." 
              className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus:border-accent-orange/50 h-9"
            />
          </div>
          <Link to="/login">
             <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Admin</Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-[#1a1a1a] overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Buscar achados..." 
                  className="pl-9 bg-[#0a0a0a] border-white/10 text-white"
                />
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path}
                    className="p-2 text-gray-300 hover:text-accent-orange hover:bg-white/5 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link 
                  to="/login"
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
