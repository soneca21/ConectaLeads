import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Sparkles } from 'lucide-react';
import { fetchCategories } from '@/lib/catalog';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then((cats) => setCategories(cats || []));
  }, []);

  const categoryLinks =
    categories.length > 0
      ? categories
      : [
          { name: 'Gadgets', slug: 'gadgets' },
          { name: 'Beleza', slug: 'beauty' },
          { name: 'Casa', slug: 'home' }
        ];

  return (
    <footer className="bg-[#1a1a1a] border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-accent-orange p-1.5 rounded-lg text-white">
                <Sparkles size={18} fill="currentColor" />
              </div>
              <span className="font-bold text-xl text-white">
                Conecta<span className="text-accent-orange">Leads</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ofertas curadas das melhores lojas. Ajudamos você a encontrar o melhor em tech, beleza e casa com preços
              imperdíveis.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-accent-orange transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent-orange transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent-orange transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Categorias</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              {categoryLinks.map((cat) => (
                <li key={cat.slug || cat.id}>
                  <Link
                    to={`/category/${cat.slug || cat.name.toLowerCase()}`}
                    className="hover:text-accent-orange transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/collections" className="hover:text-accent-orange transition-colors">
                  Coleções Especiais
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Sobre</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/about" className="hover:text-accent-orange transition-colors">
                  Nossa História
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-accent-orange transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-accent-orange transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accent-orange transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contato</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent-orange" />
                contato@conectaleads.com
              </li>
              <li>Segunda a Sexta, 9h às 18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ConectaLeads. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
