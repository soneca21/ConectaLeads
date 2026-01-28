import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useLocalization } from '@/contexts/LocalizationContext';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'created_at', direction: 'desc' });
  const { toast } = useToast();
  const { formatPrice } = useLocalization();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao carregar ofertas', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return offers.filter(o => o.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [offers, searchTerm]);

  const sorted = useMemo(() => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortConfig.field === 'title') return dir * (a.title || '').localeCompare(b.title || '');
      if (sortConfig.field === 'price') return dir * ((Number(a.price) || 0) - (Number(b.price) || 0));
      const aDate = a.created_at ? new Date(a.created_at) : 0;
      const bDate = b.created_at ? new Date(b.created_at) : 0;
      return dir * (aDate - bDate);
    });
  }, [filtered, sortConfig]);

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (field) => {
    if (sortConfig.field !== field) return <ArrowUpDown size={14} className="text-gray-500" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="text-orange-500" />
      : <ArrowDown size={14} className="text-orange-500" />;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Catálogo</h1>
          <p className="text-sm text-gray-500">Gerencie ofertas, categorias e preços.</p>
        </div>
        <Link to="/admin/offers/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus size={18} className="mr-2" /> Nova Oferta
          </Button>
        </Link>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por título..."
            className="pl-9 bg-[#0a0a0a] border-white/10 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#252525]">
            <TableRow className="border-white/5 hover:bg-[#252525]">
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-2">Título {renderSortIcon('title')}</div>
              </TableHead>
              <TableHead className="text-gray-400">Categoria</TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort('price')}>
                <div className="flex items-center gap-2">Preço {renderSortIcon('price')}</div>
              </TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Carregando...</TableCell></TableRow>
            ) : sorted.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Nenhuma oferta encontrada.</TableCell></TableRow>
            ) : (
              sorted.map((offer) => (
                <TableRow key={offer.id} className="border-white/5 hover:bg-[#252525]">
                  <TableCell className="font-medium text-white">{offer.title}</TableCell>
                  <TableCell className="text-gray-400">{offer.category}</TableCell>
                  <TableCell className="text-white">
                    {formatPrice(offer.price, { from: offer.currency || 'BRL' })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={offer.status === 'published' ? "text-green-500 border-green-500/50" : "text-yellow-500 border-yellow-500/50"}>
                      {offer.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/offers/${offer.id}`}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <Edit size={16} />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOffers;
