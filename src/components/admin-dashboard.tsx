'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Users, TrendingDown, DollarSign, Target, Award, BarChart3, Percent } from 'lucide-react';

interface DashboardData {
  totalLeads: number;
  leadsThisMonth: number;
  leadsByState: Array<{ state: string; count: number }>;
  leadsByType: Array<{ type: string; count: number }>;
  leadsByMonth: Array<{ month: string; count: number }>;
  totalSavings: number;
  totalCurrentCost: number;
  totalCMECost: number;
  altaOportunidade: number;
  estrategicas: number;
  mediaOportunidade: number;
  baixaOportunidade: number;
  ganhos: number;
  conversionRate: number;
  avgTicket: number;
  referenceItems: Array<{ id: string; name: string; category: string; refPrice: number; minPrice: number; margin: number }>;
}

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#0f766e', '#115e59', '#134e4a', '#a7f3d0', '#d1fae5'];

export function AdminDashboard() {
  const { adminToken } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!res.ok) throw new Error('Não autorizado');
        const json = await res.json();
        setData(json);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [adminToken]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">Erro ao carregar dados do dashboard.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">+{data.leadsThisMonth} mês</Badge>
            </div>
            <p className="text-2xl font-bold">{data.totalLeads}</p>
            <p className="text-xs text-muted-foreground">Total de Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data.totalSavings)}</p>
            <p className="text-xs text-muted-foreground">Potencial de Economia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">{data.altaOportunidade + data.estrategicas}</Badge>
            </div>
            <p className="text-2xl font-bold">{data.estrategicas}</p>
            <p className="text-xs text-muted-foreground">Oportunidades Estratégicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{data.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
          </CardContent>
        </Card>
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Ticket Médio</p>
            <p className="text-xl font-bold">{formatCurrency(data.avgTicket)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Alta Oportunidade</p>
            <p className="text-xl font-bold text-green-600">{data.altaOportunidade}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Média Oportunidade</p>
            <p className="text-xl font-bold text-yellow-600">{data.mediaOportunidade}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Custo Total Atual (Leads)</p>
            <p className="text-xl font-bold">{formatCurrency(data.totalCurrentCost)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads por mês */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Leads por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.leadsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                    formatter={(value: number) => [`${value} leads`, 'Leads']}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leads por estado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Leads por Estado (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.leadsByState} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis type="category" dataKey="state" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leads por tipo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Percent className="w-4 h-4" /> Leads por Tipo de Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.leadsByType} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="type" label={({ type, count }) => `${type}: ${count}`} labelLine={false} fontSize={11}>
                    {data.leadsByType.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ranking de itens com maior diferença de preço */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Referência de Monitores - Preços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 max-h-64 overflow-y-auto">
              <ResponsiveContainer width="100%" height={Math.max(200, data.referenceItems.length * 24)}>
                <BarChart data={data.referenceItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v: number) => `R$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} width={220} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 11 }} formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Preço Ref.']} />
                  <Bar dataKey="refPrice" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
