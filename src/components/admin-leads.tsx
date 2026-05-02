'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  institution: string;
  city: string;
  state: string;
  institutionType: string;
  currentTotalCost: number;
  cmeTotalCost: number;
  estimatedSaving: number;
  savingPercentage: number;
  opportunityClass: string;
  status: string;
  createdAt: string;
}

const CLASS_STYLES: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-green-100 text-green-700',
  estrategica: 'bg-emerald-100 text-emerald-700',
};

const CLASS_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  estrategica: 'Estratégica',
};

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_analise: 'Em Análise',
  devolutiva_agendada: 'Devolutiva Agendada',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
  sem_aderencia: 'Sem Aderência',
};

const INSTITUTION_LABELS: Record<string, string> = {
  hospital: 'Hospital', clinica: 'Clínica', hospital_dia: 'Hospital Dia',
  processadora: 'Processadora', maternidade: 'Maternidade', odontologia: 'Odontologia', outro: 'Outro',
};

export function AdminLeads() {
  const { adminToken, setView, selectLead } = useAppStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterClass !== 'all') params.set('classification', filterClass);
      if (filterState !== 'all') params.set('state', filterState);
      const res = await fetch(`/api/leads?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLeads(json.leads);
    } catch {
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }, [adminToken, filterStatus, filterClass, filterState]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/leads/${id}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Lead excluído com sucesso');
      fetchLeads();
    } catch {
      toast.error('Erro ao excluir lead');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetail = (id: string) => {
    selectLead(id);
    setView('admin-lead-detail');
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredLeads = leads.filter((lead) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return lead.fullName.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.institution.toLowerCase().includes(term) ||
        lead.city.toLowerCase().includes(term);
    }
    return true;
  });

  // Get unique states for filter
  const states = Array.from(new Set(leads.map((l) => l.state))).sort();

  if (loading) {
    return <Card><CardContent className="p-8"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, e-mail, instituição..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger><SelectValue placeholder="Classificação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(CLASS_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {states.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Instituição</TableHead>
                  <TableHead className="text-xs">Cidade/UF</TableHead>
                  <TableHead className="text-xs text-right">Custo Atual</TableHead>
                  <TableHead className="text-xs text-right">Custo CME</TableHead>
                  <TableHead className="text-xs text-right">Economia</TableHead>
                  <TableHead className="text-xs text-right">%</TableHead>
                  <TableHead className="text-xs">Class.</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(lead.id)}>
                      <TableCell className="text-xs">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-xs font-medium max-w-[150px] truncate">{lead.fullName}</TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate">{lead.institution}</TableCell>
                      <TableCell className="text-xs">{lead.city}/{lead.state}</TableCell>
                      <TableCell className="text-xs text-right">{formatCurrency(lead.currentTotalCost)}</TableCell>
                      <TableCell className="text-xs text-right">{formatCurrency(lead.cmeTotalCost)}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${lead.estimatedSaving > 0 ? 'text-green-600' : ''}`}>{formatCurrency(lead.estimatedSaving)}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${lead.savingPercentage > 0 ? 'text-green-600' : ''}`}>{lead.savingPercentage.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge className={`${CLASS_STYLES[lead.opportunityClass] || ''} text-[10px] px-1.5 py-0`}>
                          {CLASS_LABELS[lead.opportunityClass] || lead.opportunityClass}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {STATUS_LABELS[lead.status] || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetail(lead.id)} title="Ver detalhes">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(lead.id)} disabled={deletingId === lead.id} title="Excluir (LGPD)">
                            {deletingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="text-sm text-muted-foreground">{filteredLeads.length} lead(s) encontrado(s)</div>
    </div>
  );
}
