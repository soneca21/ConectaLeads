
import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { Users, TrendingUp, MessageCircle, Clock, Activity, AlertTriangle } from 'lucide-react';
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
    recentConversations: [],
    conversionRate: 0,
    avgCloseDays: 0,
    revenueSeries: [],
    channelEngagement: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [{ data: leads, count: totalLeads }, { data: conversations }, { data: orders }] = await Promise.all([
          supabase.from('leads').select('id,stage,score,created_at,updated_at,source', { count: 'exact' }),
          supabase.from('conversations').select('id, updated_at, status, channel, lead:leads(name)').order('updated_at', { ascending: false }),
          supabase.from('orders').select('status,total_amount,currency,created_at')
        ]);

        // Pipeline
        const stageMap = {};
        let totalScore = 0;
        leads?.forEach(lead => {
          stageMap[lead.stage] = (stageMap[lead.stage] || 0) + 1;
          totalScore += (lead.score || 0);
        });
        const leadsByStage = Object.entries(stageMap).map(([name, value]) => ({ name, value }));
        const avgScore = leads?.length ? Math.round(totalScore / (leads.length || 1)) : 0;

        // Conversion rate & average close time (rough: won stage)
        const won = leads?.filter(l => l.stage === 'won') || [];
        const conversionRate = leads?.length ? Math.round((won.length / leads.length) * 100) : 0;
        const avgCloseDays = won.length
          ? Math.round(won.reduce((acc, l) => acc + ((new Date(l.updated_at || l.created_at) - new Date(l.created_at)) / (1000 * 3600 * 24)), 0) / won.length)
          : 0;

        // Revenue series (orders per week)
        const revenueBuckets = {};
        orders?.forEach(o => {
          const d = new Date(o.created_at);
          const key = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
          revenueBuckets[key] = (revenueBuckets[key] || 0) + Number(o.total_amount || 0);
        });
        const revenueSeries = Object.entries(revenueBuckets).map(([week, value]) => ({ week, value }));

        // Channel engagement (conversations by channel)
        const channelBuckets = {};
        conversations?.forEach(c => {
          const ch = c.channel || 'whatsapp';
          channelBuckets[ch] = (channelBuckets[ch] || 0) + 1;
        });
        const channelEngagement = Object.entries(channelBuckets).map(([channel, value]) => ({ channel, value }));

        // Alerts
        const alerts = [];
        if (conversionRate < 10) alerts.push('Conversão abaixo de 10% - revise follow-ups.');
        const openConvs = conversations?.filter(c => c.status === 'open') || [];
        if (openConvs.length > 20) alerts.push('Muitas conversas abertas; distribua atendimento.');
        const staleLeads = leads?.filter(l => l.stage !== 'won' && (Date.now() - new Date(l.updated_at || l.created_at)) > 7 * 24 * 3600 * 1000) || [];
        if (staleLeads.length > 5) alerts.push('Leads sem contato há 7+ dias.');

        setStats({
          totalLeads: totalLeads || 0,
          leadsByStage,
          avgScore,
          recentConversations: conversations?.slice(0, 5) || [],
          conversionRate,
          avgCloseDays,
          revenueSeries,
          channelEngagement,
          alerts
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

        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.conversionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Leads ganhos / total</p>
            <p className="text-xs text-gray-500 mt-1">Tempo médio: {stats.avgCloseDays || '-'} dias</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="col-span-1 lg:col-span-4 bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Receita por semana</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {stats.revenueSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="week" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ background: '#1a1a1a', borderColor: '#333', color: '#fff' }} />
                  <Line type="monotone" dataKey="value" stroke="#ff6b35" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem pedidos sincronizados.</p>}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Engajamento por canal</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {stats.channelEngagement.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.channelEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="channel" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ background: '#1a1a1a', borderColor: '#333', color: '#fff' }} />
                  <Bar dataKey="value" fill="#00C49F" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem conversas registradas.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardHeader className="flex items-center gap-2">
          <AlertTriangle className="text-yellow-400" size={18} />
          <CardTitle className="text-white">Alertas inteligentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.alerts.length ? stats.alerts.map((a, i) => (
            <div key={i} className="text-sm text-yellow-200 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded">
              {a}
            </div>
          )) : <p className="text-gray-500 text-sm">Nenhum alerta no momento.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
