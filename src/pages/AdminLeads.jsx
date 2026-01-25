
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [filterStage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStage !== 'all') {
        query = query.eq('stage', filterStage);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm) || 
    lead.phone?.includes(searchTerm)
  );

  const getScoreColor = (score) => {
    if (score >= 70) return "text-red-500 bg-red-500/10";
    if (score >= 40) return "text-yellow-500 bg-yellow-500/10";
    return "text-blue-500 bg-blue-500/10";
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Gerenciar Leads</h1>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => navigate('/admin/leads/new')}>Adicionar Lead</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            className="pl-9 bg-[#1a1a1a] border-gray-800 text-white"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'new', 'qualified', 'negotiation', 'closed', 'lost'].map(stage => (
            <Button
              key={stage}
              variant={filterStage === stage ? "default" : "outline"}
              onClick={() => setFilterStage(stage)}
              className={`capitalize ${filterStage === stage ? 'bg-orange-600' : 'bg-transparent border-gray-700 text-gray-300'}`}
            >
              {stage === 'all' ? 'Todos' : stage}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#252525]">
            <TableRow className="border-gray-800 hover:bg-[#252525]">
              <TableHead className="text-gray-400">Nome</TableHead>
              <TableHead className="text-gray-400">Score</TableHead>
              <TableHead className="text-gray-400">Estágio</TableHead>
              <TableHead className="text-gray-400">Origem</TableHead>
              <TableHead className="text-gray-400">Último Contato</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-gray-500">Carregando leads...</TableCell>
               </TableRow>
            ) : filteredLeads.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhum lead encontrado.</TableCell>
               </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-gray-800 hover:bg-[#252525] transition-colors">
                  <TableCell className="font-medium text-gray-200">
                    <div>{lead.name || 'Desconhecido'}</div>
                    <div className="text-xs text-gray-500">{lead.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getScoreColor(lead.score)} border-0`}>
                      {lead.score || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700 capitalize">
                      {lead.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 capitalize">{lead.source}</TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {lead.last_contact_at ? formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true, locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" onClick={() => navigate(`/admin/leads/${lead.id}/edit`)}>
                        <Edit size={16} />
                      </Button>
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

export default AdminLeads;
