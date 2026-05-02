'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReferenceItem {
  id: string;
  name: string;
  category: string;
  refPrice: number;
  minPrice: number;
  margin: number;
  partner: string | null;
  internalNotes: string | null;
  status: string;
}

const CATEGORY_OPTIONS = [
  { value: 'limpeza_automatizada', label: 'Limpeza automatizada' },
  { value: 'esterilizacao_vapor', label: 'Esterilização a vapor' },
  { value: 'peroxido_hidrogenio', label: 'Peróxido de hidrogênio' },
];

const CATEGORY_LABELS: Record<string, string> = {
  limpeza_automatizada: 'Limpeza automatizada',
  esterilizacao_vapor: 'Esterilização a vapor',
  peroxido_hidrogenio: 'Peróxido de hidrogênio',
};

const emptyForm = { name: '', category: 'limpeza_automatizada', refPrice: '0', minPrice: '0', margin: '20', partner: '', internalNotes: '', status: 'ativo' };

export function AdminReference() {
  const { adminToken } = useAppStore();
  const [items, setItems] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/reference-items', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ReferenceItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      refPrice: String(item.refPrice),
      minPrice: String(item.minPrice),
      margin: String(item.margin),
      partner: item.partner || '',
      internalNotes: item.internalNotes || '',
      status: item.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Informe o nome do item'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/reference-items/${editingId}` : '/api/reference-items';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          refPrice: parseFloat(form.refPrice) || 0,
          minPrice: parseFloat(form.minPrice) || 0,
          margin: parseFloat(form.margin) || 0,
          partner: form.partner || null,
          internalNotes: form.internalNotes || null,
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Item atualizado' : 'Item criado');
      setDialogOpen(false);
      fetchItems();
    } catch {
      toast.error('Erro ao salvar item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/reference-items/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Item excluído');
      fetchItems();
    } catch {
      toast.error('Erro ao excluir item');
    } finally {
      setDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const handleToggle = async (item: ReferenceItem) => {
    setTogglingId(item.id);
    try {
      const newStatus = item.status === 'ativo' ? 'inativo' : 'ativo';
      const res = await fetch(`/api/reference-items/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      fetchItems();
    } catch {
      toast.error('Erro ao alterar status');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{items.length} item(ns) cadastrado(s)</div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Novo Item</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs">Categoria</TableHead>
                  <TableHead className="text-xs text-right">Preço Ref.</TableHead>
                  <TableHead className="text-xs text-right">Preço Mín.</TableHead>
                  <TableHead className="text-xs text-right">Margem</TableHead>
                  <TableHead className="text-xs">Parceiro</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs">{CATEGORY_LABELS[item.category] || item.category}</TableCell>
                    <TableCell className="text-xs text-right">{formatCurrency(item.refPrice)}</TableCell>
                    <TableCell className="text-xs text-right">{formatCurrency(item.minPrice)}</TableCell>
                    <TableCell className="text-xs text-right">{item.margin}%</TableCell>
                    <TableCell className="text-xs">{item.partner || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'} className={`text-[10px] cursor-pointer ${item.status === 'ativo' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
                        onClick={() => handleToggle(item)}>
                        {togglingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (item.status === 'ativo' ? 'Ativo' : 'Inativo')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeletingId(item.id); setDeleteOpen(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            <DialogDescription>Preencha os dados do item de referência.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORY_OPTIONS.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Preço Ref. (R$)</Label><Input type="number" step="0.01" value={form.refPrice} onChange={(e) => setForm((p) => ({ ...p, refPrice: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Preço Mín. (R$)</Label><Input type="number" step="0.01" value={form.minPrice} onChange={(e) => setForm((p) => ({ ...p, minPrice: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Margem (%)</Label><Input type="number" value={form.margin} onChange={(e) => setForm((p) => ({ ...p, margin: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Parceiro</Label><Input value={form.partner} onChange={(e) => setForm((p) => ({ ...p, partner: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notas Internas</Label><Input value={form.internalNotes} onChange={(e) => setForm((p) => ({ ...p, internalNotes: e.target.value }))} /></div>
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
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
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
