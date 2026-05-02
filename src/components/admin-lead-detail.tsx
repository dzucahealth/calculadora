'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface LeadDetail {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  role: string;
  institution: string;
  city: string;
  state: string;
  institutionType: string;
  surgicalRooms: number | null;
  hasOwnCME: boolean;
  hasTraceability: boolean;
  wantsFeedback: boolean;
  currentTotalCost: number;
  cmeTotalCost: number;
  estimatedSaving: number;
  savingPercentage: number;
  opportunityClass: string;
  status: string;
  internalNotes: string | null;
  suggestedOffer: string | null;
  consumptionData: string;
  currentValuesData: string;
  itemResultsData: string;
  createdAt: string;
  contactHistories: Array<{
    id: string;
    contactDate: string;
    summary: string;
    objections: string | null;
    nextStep: string | null;
    followUpDate: string | null;
    responsible: string | null;
  }>;
}

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'devolutiva_agendada', label: 'Devolutiva Agendada' },
  { value: 'proposta_enviada', label: 'Proposta Enviada' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'ganho', label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'sem_aderencia', label: 'Sem Aderência' },
];

const CLASS_STYLES: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-green-100 text-green-700',
  estrategica: 'bg-emerald-100 text-emerald-700',
};
const CLASS_LABELS: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta', estrategica: 'Estratégica' };
const INSTITUTION_LABELS: Record<string, string> = {
  hospital: 'Hospital', clinica: 'Clínica', hospital_dia: 'Hospital Dia',
  processadora: 'Processadora', maternidade: 'Maternidade', odontologia: 'Odontologia', outro: 'Outro',
};

export function AdminLeadDetail() {
  const { adminToken, selectedLeadId, setView } = useAppStore();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [newHistorySummary, setNewHistorySummary] = useState('');
  const [newHistoryNextStep, setNewHistoryNextStep] = useState('');
  const [newHistoryObjection, setNewHistoryObjection] = useState('');
  const [newHistoryFollowUp, setNewHistoryFollowUp] = useState('');
  const [savingHistory, setSavingHistory] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      if (!selectedLeadId) return;
      try {
        const res = await fetch(`/api/leads/${selectedLeadId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setLead(json);
        setStatus(json.status);
        setNotes(json.internalNotes || '');
      } catch {
        toast.error('Erro ao carregar lead');
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [adminToken, selectedLeadId]);

  const handleSaveStatus = async () => {
    if (!selectedLeadId) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/leads/${selectedLeadId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status atualizado');
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLeadId) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/leads/${selectedLeadId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: notes }),
      });
      if (!res.ok) throw new Error();
      toast.success('Notas salvas');
    } catch {
      toast.error('Erro ao salvar notas');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddHistory = async () => {
    if (!selectedLeadId || !newHistorySummary.trim()) { toast.error('Informe o resumo do contato'); return; }
    setSavingHistory(true);
    try {
      const res = await fetch(`/api/leads/${selectedLeadId}/history`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: newHistorySummary,
          objections: newHistoryObjection || null,
          nextStep: newHistoryNextStep || null,
          followUpDate: newHistoryFollowUp || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Histórico adicionado');
      setNewHistorySummary('');
      setNewHistoryNextStep('');
      setNewHistoryObjection('');
      setNewHistoryFollowUp('');
      // Refresh lead
      const leadRes = await fetch(`/api/leads/${selectedLeadId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (leadRes.ok) setLead(await leadRes.json());
    } catch {
      toast.error('Erro ao adicionar histórico');
    } finally {
      setSavingHistory(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handlePrintReport = () => {
    if (!lead) return;
    let itemResults: Array<{ name: string; quantity: number; userUnitPrice: number; refUnitPrice: number; currentCost: number; cmeCost: number; saving: number }> = [];
    try { itemResults = JSON.parse(lead.itemResultsData); } catch { /* empty */ }

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Lead - ${lead.fullName}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#333}
    h1{color:#0d9488;font-size:20px;margin-bottom:20px}h2{color:#0d9488;font-size:16px;margin:20px 0 10px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px}.section{margin:20px 0}
    table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}th{background:#f0fdfa;padding:8px;text-align:left;border-bottom:2px solid #0d9488}
    td{padding:8px;border-bottom:1px solid #eee}.badge{padding:2px 8px;border-radius:4px;font-size:11px}
    .green{color:#059669}.footer{margin-top:40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:15px}</style></head>
    <body><h1>Relatório Interno - Lead #${lead.id.slice(-6)}</h1>
    <div class="grid"><div><strong>Nome:</strong> ${lead.fullName}</div><div><strong>E-mail:</strong> ${lead.email}</div>
    <div><strong>WhatsApp:</strong> ${lead.whatsapp}</div><div><strong>Instituição:</strong> ${lead.institution}</div>
    <div><strong>Cidade/UF:</strong> ${lead.city}/${lead.state}</div><div><strong>Tipo:</strong> ${INSTITUTION_LABELS[lead.institutionType] || lead.institutionType}</div>
    <div><strong>CME própria:</strong> ${lead.hasOwnCME ? 'Sim' : 'Não'}</div><div><strong>Rastreabilidade:</strong> ${lead.hasTraceability ? 'Sim' : 'Não'}</div></div>
    <div class="section"><h2>Resumo Financeiro</h2>
    <div class="grid"><div><strong>Custo Atual:</strong> ${formatCurrency(lead.currentTotalCost)}</div>
    <div><strong>Custo CME:</strong> ${formatCurrency(lead.cmeTotalCost)}</div>
    <div><strong>Economia:</strong> <span class="green">${formatCurrency(lead.estimatedSaving)}</span></div>
    <div><strong>% Economia:</strong> <span class="green">${lead.savingPercentage.toFixed(1)}%</span></div></div>
    ${lead.suggestedOffer ? `<p style="margin-top:10px"><strong>Oferta sugerida:</strong> ${lead.suggestedOffer}</p>` : ''}</div>
    <div class="section"><h2>Detalhamento por Item</h2>
    <table><thead><tr><th>Item</th><th style="text-align:right">Qtd</th><th style="text-align:right">Vl. Atual</th><th style="text-align:right">Vl. CME</th><th style="text-align:right">Economia</th></tr></thead>
    <tbody>${itemResults.map((i) => `<tr><td>${i.name}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">${formatCurrency(i.userUnitPrice)}</td><td style="text-align:right">${formatCurrency(i.refUnitPrice)}</td><td style="text-align:right" class="green">${formatCurrency(i.saving)}</td></tr>`).join('')}</tbody></table></div>
    ${lead.internalNotes ? `<div class="section"><h2>Notas Internas</h2><p style="font-size:13px">${lead.internalNotes}</p></div>` : ''}
    <div class="footer"><p>CME INTELIGENTE - Relatório Interno | Gerado em ${new Date().toLocaleString('pt-BR')}</p></div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  if (loading) {
    return <Card><CardContent className="p-8"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></CardContent></Card>;
  }

  if (!lead) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">Lead não encontrado.</CardContent></Card>;
  }

  let itemResults: Array<{ name: string; quantity: number; userUnitPrice: number; refUnitPrice: number; currentCost: number; cmeCost: number; saving: number }> = [];
  try { itemResults = JSON.parse(lead.itemResultsData); } catch { /* empty */ }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView('admin-leads')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar aos Leads
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrintReport}>
          Exportar PDF
        </Button>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{lead.fullName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${CLASS_STYLES[lead.opportunityClass] || ''}`}>
                  {CLASS_LABELS[lead.opportunityClass] || lead.opportunityClass}
                </Badge>
                <span className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">E-mail:</span> {lead.email}</div>
              <div><span className="text-muted-foreground">WhatsApp:</span> {lead.whatsapp}</div>
              <div><span className="text-muted-foreground">Cargo:</span> {lead.role || '—'}</div>
              <div><span className="text-muted-foreground">Instituição:</span> {lead.institution}</div>
              <div><span className="text-muted-foreground">Tipo:</span> {INSTITUTION_LABELS[lead.institutionType] || lead.institutionType}</div>
              <div><span className="text-muted-foreground">Cidade/UF:</span> {lead.city}/{lead.state}</div>
              <div><span className="text-muted-foreground">Salas cirúrgicas:</span> {lead.surgicalRooms || '—'}</div>
              <div><span className="text-muted-foreground">CME própria:</span> {lead.hasOwnCME ? 'Sim' : 'Não'}</div>
              <div><span className="text-muted-foreground">Rastreabilidade:</span> {lead.hasTraceability ? 'Sim' : 'Não'}</div>
              <div><span className="text-muted-foreground">Deseja devolutiva:</span> {lead.wantsFeedback ? 'Sim' : 'Não'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Notes */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <div className="flex gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                </Select>
                <Button size="icon" variant="outline" onClick={handleSaveStatus} disabled={savingStatus}>
                  {savingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notas Internas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Notas internas..." />
              <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Resumo Financeiro</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Custo Atual</p>
              <p className="text-lg font-bold">{formatCurrency(lead.currentTotalCost)}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Custo CME</p>
              <p className="text-lg font-bold">{formatCurrency(lead.cmeTotalCost)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Economia</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(lead.estimatedSaving)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-muted-foreground">% Economia</p>
              <p className="text-lg font-bold text-green-600">{lead.savingPercentage.toFixed(1)}%</p>
            </div>
          </div>
          {lead.suggestedOffer && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-medium text-primary mb-1">Oferta Sugerida:</p>
              <p className="text-sm">{lead.suggestedOffer}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Detalhamento por Item</CardTitle></CardHeader>
        <CardContent>
          {itemResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item registrado.</p>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0"><tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-2 font-medium">Item</th>
                  <th className="text-right py-2 px-2 font-medium">Qtd</th>
                  <th className="text-right py-2 px-2 font-medium">Vl. Atual</th>
                  <th className="text-right py-2 px-2 font-medium">Vl. CME</th>
                  <th className="text-right py-2 px-2 font-medium">Economia</th>
                </tr></thead>
                <tbody>
                  {itemResults.map((item) => (
                    <tr key={item.name} className="border-t">
                      <td className="py-2 px-2">{item.name}</td>
                      <td className="text-right py-2 px-2">{item.quantity}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(item.userUnitPrice)}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(item.refUnitPrice)}</td>
                      <td className={`text-right py-2 px-2 font-medium ${item.saving > 0 ? 'text-green-600' : ''}`}>{formatCurrency(item.saving)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact History */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Histórico de Contato</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Add new entry */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Resumo do contato *</Label>
              <Textarea value={newHistorySummary} onChange={(e) => setNewHistorySummary(e.target.value)} rows={2} placeholder="Descreva o contato..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Próximo passo</Label>
                <Input value={newHistoryNextStep} onChange={(e) => setNewHistoryNextStep(e.target.value)} placeholder="Ex: Agendar reunião" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Objeções</Label>
                <Input value={newHistoryObjection} onChange={(e) => setNewHistoryObjection(e.target.value)} placeholder="Ex: Preço alto" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data follow-up</Label>
                <Input type="date" value={newHistoryFollowUp} onChange={(e) => setNewHistoryFollowUp(e.target.value)} />
              </div>
            </div>
            <Button size="sm" onClick={handleAddHistory} disabled={savingHistory}>
              {savingHistory ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Adicionar
            </Button>
          </div>

          <Separator />

          {/* History list */}
          {lead.contactHistories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum contato registrado.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {lead.contactHistories.map((h) => (
                <div key={h.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{new Date(h.contactDate).toLocaleString('pt-BR')}</span>
                    {h.responsible && <Badge variant="secondary" className="text-[10px]">{h.responsible}</Badge>}
                  </div>
                  <p className="text-sm">{h.summary}</p>
                  {h.objections && <p className="text-xs text-muted-foreground mt-1"><strong>Objeções:</strong> {h.objections}</p>}
                  {h.nextStep && <p className="text-xs text-muted-foreground"><strong>Próximo passo:</strong> {h.nextStep}</p>}
                  {h.followUpDate && <p className="text-xs text-muted-foreground"><strong>Follow-up:</strong> {new Date(h.followUpDate).toLocaleDateString('pt-BR')}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
