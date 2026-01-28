
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (location.state?.searchTerm) {
      const term = (location.state.searchTerm || '').toLowerCase();
      setSearchTerm(term);
      setCurrentPage(1);
    }
  }, [location.state]);

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
      toast({ variant: 'destructive', title: 'Erro ao carregar leads', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm) || 
    lead.phone?.includes(searchTerm)
  );

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const { field, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;

    if (field === 'name') {
      return dir * (a.name || '').localeCompare(b.name || '');
    }

    if (field === 'score') {
      return dir * ((a.score || 0) - (b.score || 0));
    }

    if (field === 'last_contact_at') {
      const aDate = a.last_contact_at ? new Date(a.last_contact_at) : null;
      const bDate = b.last_contact_at ? new Date(b.last_contact_at) : null;
      if (!aDate && !bDate) return 0;
      if (!aDate) return dir * -1;
      if (!bDate) return dir * 1;
      return dir * (aDate - bDate);
    }

    const aCreated = a.created_at ? new Date(a.created_at) : 0;
    const bCreated = b.created_at ? new Date(b.created_at) : 0;
    return dir * (aCreated - bCreated);
  });

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
    setCurrentPage(prev => Math.min(prev, maxPage));
  }, [sortedLeads.length]);

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const current = Math.min(currentPage, totalPages);
  const startIndex = (current - 1) * pageSize;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + pageSize);

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortConfig.field !== field) return <ArrowUpDown size={14} className="text-gray-500" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-orange-500" /> 
      : <ArrowDown size={14} className="text-orange-500" />;
  };

  const handleStageChange = (stage) => {
    setFilterStage(stage);
    setCurrentPage(1);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-red-500 bg-red-500/10";
    if (score >= 40) return "text-yellow-500 bg-yellow-500/10";
    return "text-blue-500 bg-blue-500/10";
  };

  const exportCsv = () => {
    try {
      setExporting(true);
      const rows = [
        ['Nome', 'Telefone', 'Score', 'Estágio', 'Origem', 'Último Contato'],
        ...sortedLeads.map(l => [
          l.name || '',
          l.phone || '',
          l.score ?? '',
          l.stage || '',
          l.source || '',
          l.last_contact_at ? new Date(l.last_contact_at).toISOString() : ''
        ])
      ];
      const csvContent = rows
        .map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Gerenciar Leads</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-200"
            onClick={exportCsv}
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : (
              <div className="flex items-center gap-2">
                <Download size={16} /> Exportar CSV
              </div>
            )}
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => navigate('/admin/leads/new')}>Adicionar Lead</Button>
        </div>
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
              onClick={() => handleStageChange(stage)}
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
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">Nome {renderSortIcon('name')}</div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort('score')}>
                <div className="flex items-center gap-2">Score {renderSortIcon('score')}</div>
              </TableHead>
              <TableHead className="text-gray-400">Estágio</TableHead>
              <TableHead className="text-gray-400">Origem</TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort('last_contact_at')}>
                <div className="flex items-center gap-2">Último Contato {renderSortIcon('last_contact_at')}</div>
              </TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <>
                 {Array.from({ length: 5 }).map((_, idx) => (
                   <TableRow key={idx} className="border-gray-800">
                     {Array.from({ length: 6 }).map((__, i) => (
                       <TableCell key={i}><Skeleton className="h-5 w-full bg-white/5" /></TableCell>
                     ))}
                   </TableRow>
                 ))}
               </>
            ) : filteredLeads.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhum lead encontrado.</TableCell>
               </TableRow>
            ) : (
              paginatedLeads.map((lead) => (
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 mt-4 bg-[#181818] border border-gray-800 rounded-lg">
        <div className="text-sm text-gray-400">
          Mostrando {sortedLeads.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, sortedLeads.length)} de {sortedLeads.length}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 1}
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Anterior
          </Button>
          <div className="text-sm text-gray-300">Página {current} de {totalPages}</div>
          <Button
            variant="outline"
            size="sm"
            disabled={current === totalPages}
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;

