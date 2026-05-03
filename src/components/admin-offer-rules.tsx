'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OfferRule {
  id: string;
  minRange: number;
  maxRange: number;
  benefit: string;
  internalNote: string | null;
  showToUser: boolean;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const emptyForm = { minRange: '0', maxRange: '0', benefit: '', internalNote: '', showToUser: true };

export function AdminOfferRules() {
  const { adminToken } = useAppStore();
  const [rules, setRules] = useState<OfferRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('/api/offer-rules', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error();
      setRules(await res.json());
    } catch {
      toast.error('Erro ao carregar regras');
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (rule: OfferRule) => {
    setEditingId(rule.id);
    setForm({
      minRange: String(rule.minRange),
      maxRange: String(rule.maxRange),
      benefit: rule.benefit,
      internalNote: rule.internalNote || '',
      showToUser: rule.showToUser,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.benefit.trim()) { toast.error('Informe o benefício'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/offer-rules/${editingId}` : '/api/offer-rules';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minRange: parseFloat(form.minRange) || 0,
          maxRange: parseFloat(form.maxRange) || 0,
          benefit: form.benefit,
          internalNote: form.internalNote || null,
          showToUser: form.showToUser,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Regra atualizada' : 'Regra criada');
      setDialogOpen(false);
      fetchRules();
    } catch {
      toast.error('Erro ao salvar regra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/offer-rules/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Regra excluída');
      fetchRules();
    } catch {
      toast.error('Erro ao excluir regra');
    } finally {
      setDeleteOpen(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{rules.length} regra(s) cadastrada(s)</div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Nova Regra</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Faixa Mínima</TableHead>
                <TableHead className="text-xs">Faixa Máxima</TableHead>
                <TableHead className="text-xs">Benefício</TableHead>
                <TableHead className="text-xs">Nota Interna</TableHead>
                <TableHead className="text-xs">Exibir</TableHead>
                <TableHead className="text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="text-xs">{formatCurrency(rule.minRange)}</TableCell>
                  <TableCell className="text-xs">{rule.maxRange === 0 ? 'Acima de ' + formatCurrency(rule.minRange) : formatCurrency(rule.maxRange)}</TableCell>
                  <TableCell className="text-xs max-w-[250px] truncate">{rule.benefit}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{rule.internalNote || '—'}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${rule.showToUser ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {rule.showToUser ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rule)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeletingId(rule.id); setDeleteOpen(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma regra cadastrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Regra' : 'Nova Regra'}</DialogTitle>
            <DialogDescription>Defina a faixa e benefício da oferta.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Faixa mínima (R$)</Label><Input type="number" value={form.minRange} onChange={(e) => setForm((p) => ({ ...p, minRange: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Faixa máxima (R$)</Label><Input type="number" value={form.maxRange} onChange={(e) => setForm((p) => ({ ...p, maxRange: e.target.value }))} placeholder="0 = sem limite" /></div>
            </div>
            <div className="space-y-2"><Label>Benefício *</Label><Input value={form.benefit} onChange={(e) => setForm((p) => ({ ...p, benefit: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Nota interna</Label><Input value={form.internalNote} onChange={(e) => setForm((p) => ({ ...p, internalNote: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <Checkbox id="showToUser" checked={form.showToUser} onCheckedChange={(v) => setForm((p) => ({ ...p, showToUser: v === true }))} />
              <Label htmlFor="showToUser" className="text-sm">Exibir ao usuário na simulação</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
