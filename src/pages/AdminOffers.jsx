
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('offers').delete().eq('id', deleteId);
      if (error) throw error;
      
      setOffers(offers.filter(o => o.id !== deleteId));
      toast({ title: "Oferta Deletada", description: "A oferta foi removida com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível deletar a oferta." });
    }
  };

  const filteredOffers = offers.filter(offer => 
    offer.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Ofertas</h1>
        <Link to="/admin/offers/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus size={18} className="mr-2" /> Nova Oferta
          </Button>
        </Link>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 mb-6">
        <div className="relative max-w-sm">
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
              <TableHead className="text-gray-400">Título</TableHead>
              <TableHead className="text-gray-400">Categoria</TableHead>
              <TableHead className="text-gray-400">Preço</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Carregando...</TableCell></TableRow>
            ) : filteredOffers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Nenhuma oferta encontrada.</TableCell></TableRow>
            ) : (
              filteredOffers.map((offer) => (
                <TableRow key={offer.id} className="border-white/5 hover:bg-[#252525]">
                  <TableCell className="font-medium text-white">{offer.title}</TableCell>
                  <TableCell className="text-gray-400">{offer.category}</TableCell>
                  <TableCell className="text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.price)}
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
                       <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => setDeleteId(offer.id)}>
                         <Trash2 size={16} />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deletar Oferta"
        message="Tem certeza que deseja deletar esta oferta? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminOffers;
