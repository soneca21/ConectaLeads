
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, MessageCircle, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#ff6b35', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsByStage: [],
    avgScore: 0,
    recentConversations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Total Leads
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // 2. Leads by Stage
        const { data: leads } = await supabase
          .from('leads')
          .select('stage, score');
        
        const stageMap = {};
        let totalScore = 0;
        
        leads?.forEach(lead => {
          stageMap[lead.stage] = (stageMap[lead.stage] || 0) + 1;
          totalScore += (lead.score || 0);
        });

        const leadsByStage = Object.entries(stageMap).map(([name, value]) => ({ name, value }));
        const avgScore = leads?.length ? Math.round(totalScore / leads.length) : 0;

        // 3. Recent Conversations
        const { data: recentConversations } = await supabase
          .from('conversations')
          .select('id, updated_at, status, lead:leads(name)')
          .order('updated_at', { ascending: false })
          .limit(5);

        setStats({
          totalLeads: totalLeads || 0,
          leadsByStage,
          avgScore,
          recentConversations: recentConversations || []
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Carregando painel...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Visão Geral</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLeads}</div>
            <p className="text-xs text-gray-500 mt-1">Todo o período</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Score Médio</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
            <p className="text-xs text-gray-500 mt-1">Média global</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Chats Ativos</CardTitle>
            <MessageCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.recentConversations.filter(c => c.status === 'open').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Abertos agora</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="col-span-1 lg:col-span-4 bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Distribuição de Leads</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             {stats.leadsByStage.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leadsByStage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.leadsByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <p className="text-gray-500">Nenhum dado disponível</p>
             )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentConversations.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg bg-[#252525]">
                  <div>
                    <p className="font-medium text-gray-200">{conv.lead?.name || 'Lead Desconhecido'}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    conv.status === 'open' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {conv.status === 'open' ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
              ))}
              {stats.recentConversations.length === 0 && <p className="text-gray-500 text-sm">Nenhuma conversa recente.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
