import React, { useEffect, useRef, useState } from 'react';
import { Bell, Search, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      runSearch(term);
    }, 300);
    return () => clearTimeout(handler);
  }, [term]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const runSearch = async (value) => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const searchValue = `%${value}%`;
      const [leadsRes, offersRes, convsRes] = await Promise.all([
        supabase.from('leads').select('id, name, phone').ilike('name', searchValue).limit(5),
        supabase.from('offers').select('id, title, category').ilike('title', searchValue).limit(5),
        supabase.from('conversations').select('id, lead:leads(name, phone)').order('updated_at', { ascending: false }).limit(15)
      ]);

      const convFiltered = (convsRes.data || []).filter(c =>
        c.lead?.name?.toLowerCase().includes(value.toLowerCase()) ||
        c.lead?.phone?.includes(value)
      ).slice(0, 5);

      const list = [
        ...(leadsRes.data || []).map(item => ({
          type: 'Lead',
          id: item.id,
          title: item.name || 'Sem nome',
          subtitle: item.phone,
          href: `/admin/leads/${item.id}`
        })),
        ...(offersRes.data || []).map(item => ({
          type: 'Oferta',
          id: item.id,
          title: item.title,
          subtitle: item.category || 'Sem categoria',
          href: `/admin/offers/${item.id}`
        })),
        ...(convFiltered.map(item => ({
          type: 'Conversa',
          id: item.id,
          title: item.lead?.name || 'Lead sem nome',
          subtitle: item.lead?.phone || '',
          href: `/admin/inbox`
        })) || [])
      ];
      setSuggestions(list);
      setOpen(true);
    } catch (error) {
      console.error('Erro na busca global:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (href, extra = {}) => {
    setOpen(false);
    setTerm('');
    navigate(href, { state: extra });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0].href);
    } else if (term.length > 0) {
      navigate('/admin/leads', { state: { searchTerm: term } });
    }
  };

  return (
    <div className="h-16 bg-[var(--bg-secondary)] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40 ml-[80px] md:ml-0 w-full shadow-sm">
      <div className="hidden md:block text-[var(--text-secondary)] text-sm font-medium">
        Painel <span className="mx-2 text-gray-600">/</span> <span className="text-white">Visão Geral</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative hidden sm:block w-72" ref={boxRef}>
          <form onSubmit={handleSubmit}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => term.length >= 2 && setOpen(true)}
              placeholder="Buscar leads, ofertas ou conversas..."
              className="pl-9 bg-[var(--bg-primary)] border-white/10 text-sm focus:border-[var(--accent-orange)]/50 focus:ring-0 text-white placeholder:text-gray-600"
            />
          </form>
          {open && term.length >= 2 && (
            <div className="absolute mt-1 w-full bg-[var(--bg-primary)] border border-white/10 rounded-lg shadow-xl max-h-80 overflow-auto">
              {searching ? (
                <div className="p-3 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-3 text-sm text-gray-400">Nenhum resultado</div>
              ) : (
                suggestions.map((item) => (
                  <button
                    type="button"
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.href, { fromSearch: true, searchTerm: term, convId: item.type === 'Conversa' ? item.id : undefined })}
                    className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm text-white">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.type} • {item.subtitle}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-[var(--bg-primary)] rounded-full hover:bg-white/5 border border-white/5" aria-label="Notificações">
          <Bell size={18} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-secondary)]"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-red-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-[var(--bg-secondary)]">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-none mb-1">Usuário Admin</p>
            <p className="text-xs text-[var(--text-secondary)]">admin@conectaleads.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
