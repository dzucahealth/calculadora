'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type CalculatorData } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const STEPS = ['Dados de Contato', 'Dados de Consumo', 'Valores Atuais', 'Confirmação'];

const CATEGORY_LABELS: Record<string, string> = {
  limpeza_automatizada: 'Limpeza automatizada',
  esterilizacao_vapor: 'Esterilização a vapor',
  peroxido_hidrogenio: 'Peróxido de hidrogênio',
};

const CATEGORY_ICONS: Record<string, string> = {
  limpeza_automatizada: '🧹',
  esterilizacao_vapor: '💨',
  peroxido_hidrogenio: '🧪',
};

const INSTITUTION_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'hospital_dia', label: 'Hospital Dia' },
  { value: 'processadora', label: 'Empresa Processadora' },
  { value: 'maternidade', label: 'Maternidade' },
  { value: 'odontologia', label: 'Odontologia' },
  { value: 'outro', label: 'Outro' },
];

const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RO','RR','RS','SC','SP','SE','TO',
];

export function CalculatorForm() {
  const { setView, setCalculatorData, setCalculationResult } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [referenceItems, setReferenceItems] = useState<Array<{ name: string; category: string }>>([]);

  const [contactData, setContactData] = useState({
    fullName: '', email: '', whatsapp: '', role: '', institution: '', city: '', state: '',
    institutionType: '', surgicalRooms: '', hasOwnCME: '', hasTraceability: '', wantsFeedback: 'sim',
  });

  const [consumptionData, setConsumptionData] = useState<Record<string, { quantity: number; category: string }>>({});
  const [currentValuesData, setCurrentValuesData] = useState<Record<string, { userUnitPrice: number; quantityBought: number; supplier: string; notes: string }>>({});
  const [lgpdConsent, setLgpdConsent] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/public-reference');
        const data = await res.json();
        const items: Array<{ name: string; category: string }> = [];
        for (const [category, names] of Object.entries(data)) {
          for (const name of names as string[]) {
            items.push({ name, category });
          }
        }
        setReferenceItems(items);
        const initialConsumption: Record<string, { quantity: number; category: string }> = {};
        const initialValues: Record<string, { userUnitPrice: number; quantityBought: number; supplier: string; notes: string }> = {};
        for (const item of items) {
          initialConsumption[item.name] = { quantity: 0, category: item.category };
          initialValues[item.name] = { userUnitPrice: 0, quantityBought: 0, supplier: '', notes: '' };
        }
        setConsumptionData(initialConsumption);
        setCurrentValuesData(initialValues);
      } catch {
        toast.error('Erro ao carregar itens de referência');
      }
    }
    fetchItems();
  }, []);

  const updateContact = (field: string, value: string) => {
    setContactData((prev) => ({ ...prev, [field]: value }));
  };

  const updateConsumption = (name: string, quantity: number) => {
    setConsumptionData((prev) => ({ ...prev, [name]: { ...prev[name], quantity } }));
  };

  const updateCurrentValue = (name: string, field: string, value: string | number) => {
    setCurrentValuesData((prev) => ({ ...prev, [name]: { ...prev[name], [field]: value } }));
  };

  const itemsWithQuantity = Object.entries(consumptionData).filter(([, d]) => d.quantity > 0);

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!contactData.fullName.trim()) { toast.error('Informe o nome completo'); return false; }
      if (!contactData.email.trim() || !contactData.email.includes('@')) { toast.error('Informe um e-mail válido'); return false; }
      if (!contactData.whatsapp.trim()) { toast.error('Informe o WhatsApp'); return false; }
      if (!contactData.institution.trim()) { toast.error('Informe a instituição'); return false; }
      if (!contactData.city.trim()) { toast.error('Informe a cidade'); return false; }
      if (!contactData.state) { toast.error('Informe o estado'); return false; }
      if (!contactData.institutionType) { toast.error('Selecione o tipo de instituição'); return false; }
    }
    if (step === 1) {
      if (itemsWithQuantity.length === 0) { toast.error('Informe ao menos um item de consumo'); return false; }
    }
    if (step === 2) {
      const hasInvalidPrice = itemsWithQuantity.some(([name]) => (currentValuesData[name]?.userUnitPrice || 0) <= 0);
      if (hasInvalidPrice) { toast.error('Informe o valor unitário atual para todos os itens selecionados'); return false; }
    }
    if (step === 3) {
      if (!lgpdConsent) { toast.error('É necessário aceitar o termo LGPD'); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep() && step < 3) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const calcRes = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consumptionData, currentValuesData }),
      });
      const calcData = await calcRes.json();
      if (!calcRes.ok) throw new Error(calcData.error || 'Erro no cálculo');

      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumptionData,
          currentValuesData,
          itemResults: calcData.itemResults,
          contactData: {
            ...contactData,
            surgicalRooms: contactData.surgicalRooms ? parseInt(contactData.surgicalRooms) : null,
            hasOwnCME: contactData.hasOwnCME === 'sim',
            hasTraceability: contactData.hasTraceability === 'sim',
            wantsFeedback: contactData.wantsFeedback === 'sim',
          },
        }),
      });
      const leadData = await leadRes.json();
      if (!leadRes.ok) throw new Error(leadData.error || 'Erro ao salvar');

      const fullData: CalculatorData = {
        contactData: {
          fullName: contactData.fullName, email: contactData.email, whatsapp: contactData.whatsapp,
          role: contactData.role, institution: contactData.institution, city: contactData.city,
          state: contactData.state, institutionType: contactData.institutionType,
          surgicalRooms: contactData.surgicalRooms ? parseInt(contactData.surgicalRooms) : null,
          hasOwnCME: contactData.hasOwnCME === 'sim', hasTraceability: contactData.hasTraceability === 'sim',
          wantsFeedback: contactData.wantsFeedback === 'sim', lgpdConsent: true,
        },
        consumptionData,
        currentValuesData,
      };

      setCalculatorData(fullData);
      setCalculationResult({ ...calcData, leadId: leadData.leadId });
      setView('results');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar simulação');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const groupedItems = referenceItems.reduce<Record<string, Array<{ name: string; category: string }>>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <Image src="/logo-cme.png" alt="CME INTELIGENTE" width={40} height={40} className="h-10 w-auto" />
            <div>
              <h1 className="text-sm font-bold text-primary">CME INTELIGENTE</h1>
              <p className="text-xs text-muted-foreground">Calculadora de Consumíveis</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary/10 border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs font-medium">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader><CardTitle>Dados de Contato</CardTitle><CardDescription>Informe seus dados pessoais e da instituição.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nome completo *</Label><Input placeholder="Seu nome completo" value={contactData.fullName} onChange={(e) => updateContact('fullName', e.target.value)} /></div>
                  <div className="space-y-2"><Label>E-mail *</Label><Input type="email" placeholder="seu@email.com" value={contactData.email} onChange={(e) => updateContact('email', e.target.value)} /></div>
                  <div className="space-y-2"><Label>WhatsApp *</Label><Input placeholder="(00) 00000-0000" value={contactData.whatsapp} onChange={(e) => updateContact('whatsapp', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Cargo/Função</Label><Input placeholder="Ex: Enfermeiro(a) do CME" value={contactData.role} onChange={(e) => updateContact('role', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Instituição *</Label><Input placeholder="Nome da instituição" value={contactData.institution} onChange={(e) => updateContact('institution', e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Tipo de instituição *</Label>
                    <Select value={contactData.institutionType} onValueChange={(v) => updateContact('institutionType', v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{INSTITUTION_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Cidade *</Label><Input placeholder="Sua cidade" value={contactData.city} onChange={(e) => updateContact('city', e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Select value={contactData.state} onValueChange={(v) => updateContact('state', v)}>
                      <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>{BRAZILIAN_STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Qtd. salas cirúrgicas</Label><Input type="number" placeholder="Opcional" value={contactData.surgicalRooms} onChange={(e) => updateContact('surgicalRooms', e.target.value)} /></div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Possui CME própria?</Label><RadioGroup value={contactData.hasOwnCME} onValueChange={(v) => updateContact('hasOwnCME', v)} className="flex gap-4"><div className="flex items-center gap-2"><RadioGroupItem value="sim" id="cme-sim" /><Label htmlFor="cme-sim">Sim</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="nao" id="cme-nao" /><Label htmlFor="cme-nao">Não</Label></div></RadioGroup></div>
                  <div className="space-y-2"><Label>Possui sistema de rastreabilidade?</Label><RadioGroup value={contactData.hasTraceability} onValueChange={(v) => updateContact('hasTraceability', v)} className="flex gap-4"><div className="flex items-center gap-2"><RadioGroupItem value="sim" id="trace-sim" /><Label htmlFor="trace-sim">Sim</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="nao" id="trace-nao" /><Label htmlFor="trace-nao">Não</Label></div></RadioGroup></div>
                  <div className="space-y-2"><Label>Deseja receber devolutiva técnica/comercial?</Label><RadioGroup value={contactData.wantsFeedback} onValueChange={(v) => updateContact('wantsFeedback', v)} className="flex gap-4"><div className="flex items-center gap-2"><RadioGroupItem value="sim" id="fb-sim" /><Label htmlFor="fb-sim">Sim</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="nao" id="fb-nao" /><Label htmlFor="fb-nao">Não</Label></div></RadioGroup></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <Card><CardHeader><CardTitle>Dados de Consumo Mensal</CardTitle><CardDescription>Informe a quantidade mensal consumida de cada item. Deixe em branco (0) os itens que não utiliza.</CardDescription></CardHeader></Card>
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category}>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><span>{CATEGORY_ICONS[category] || '📦'}</span>{CATEGORY_LABELS[category] || category}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0"><Label className="text-sm font-normal">{item.name}</Label></div>
                      <div className="flex items-center gap-2 w-full sm:w-40">
                        <Input type="number" min={0} placeholder="0" value={consumptionData[item.name]?.quantity || ''} onChange={(e) => updateConsumption(item.name, parseInt(e.target.value) || 0)} className="text-right" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">un/mês</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <Card><CardHeader><CardTitle>Valores Atuais</CardTitle><CardDescription>Informe o valor unitário que você paga atualmente por cada item selecionado.</CardDescription></CardHeader></Card>
            {itemsWithQuantity.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum item com quantidade informada.</CardContent></Card>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => {
                const filteredItems = items.filter((i) => consumptionData[i.name]?.quantity > 0);
                if (filteredItems.length === 0) return null;
                return (
                  <Card key={category}>
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><span>{CATEGORY_ICONS[category] || '📦'}</span>{CATEGORY_LABELS[category] || category}</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      {filteredItems.map((item) => (
                        <div key={item.name} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2"><Label className="font-medium">{item.name}</Label><Badge variant="secondary" className="text-xs">Qtd: {consumptionData[item.name]?.quantity} un/mês</Badge></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Valor unitário atual (R$) *</Label><Input type="number" step="0.01" min={0} placeholder="0,00" value={currentValuesData[item.name]?.userUnitPrice || ''} onChange={(e) => updateCurrentValue(item.name, 'userUnitPrice', parseFloat(e.target.value) || 0)} /></div>
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Custo mensal atual</Label><div className="h-9 flex items-center px-3 rounded-md border bg-muted/50 text-sm font-medium">{formatCurrency((currentValuesData[item.name]?.userUnitPrice || 0) * (consumptionData[item.name]?.quantity || 0))}</div></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Fornecedor atual</Label><Input placeholder="Nome do fornecedor (opcional)" value={currentValuesData[item.name]?.supplier || ''} onChange={(e) => updateCurrentValue(item.name, 'supplier', e.target.value)} /></div>
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Observação</Label><Input placeholder="Observação (opcional)" value={currentValuesData[item.name]?.notes || ''} onChange={(e) => updateCurrentValue(item.name, 'notes', e.target.value)} /></div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Resumo e Confirmação</CardTitle><CardDescription>Revise os dados antes de gerar o resultado.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary">Dados de Contato</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Nome:</span> {contactData.fullName}</div>
                    <div><span className="text-muted-foreground">E-mail:</span> {contactData.email}</div>
                    <div><span className="text-muted-foreground">WhatsApp:</span> {contactData.whatsapp}</div>
                    <div><span className="text-muted-foreground">Instituição:</span> {contactData.institution}</div>
                    <div><span className="text-muted-foreground">Cidade/Estado:</span> {contactData.city}/{contactData.state}</div>
                    <div><span className="text-muted-foreground">Tipo:</span> {INSTITUTION_TYPES.find((t) => t.value === contactData.institutionType)?.label}</div>
                    <div><span className="text-muted-foreground">CME própria:</span> {contactData.hasOwnCME === 'sim' ? 'Sim' : contactData.hasOwnCME === 'nao' ? 'Não' : '—'}</div>
                    <div><span className="text-muted-foreground">Rastreabilidade:</span> {contactData.hasTraceability === 'sim' ? 'Sim' : contactData.hasTraceability === 'nao' ? 'Não' : '—'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary">Itens Selecionados ({itemsWithQuantity.length})</h3>
                  <div className="max-h-64 overflow-y-auto rounded border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0"><tr><th className="text-left p-2 font-medium">Item</th><th className="text-right p-2 font-medium">Qtd</th><th className="text-right p-2 font-medium">Valor unit.</th><th className="text-right p-2 font-medium">Custo mensal</th></tr></thead>
                      <tbody>
                        {itemsWithQuantity.map(([name]) => {
                          const qty = consumptionData[name].quantity;
                          const unitPrice = currentValuesData[name]?.userUnitPrice || 0;
                          return (<tr key={name} className="border-t"><td className="p-2">{name}</td><td className="text-right p-2">{qty}</td><td className="text-right p-2">{formatCurrency(unitPrice)}</td><td className="text-right p-2 font-medium">{formatCurrency(qty * unitPrice)}</td></tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox id="lgpd" checked={lgpdConsent} onCheckedChange={(v) => setLgpdConsent(v === true)} className="mt-0.5" />
                    <Label htmlFor="lgpd" className="text-sm leading-relaxed cursor-pointer">
                      Declaro que as informações fornecidas são verdadeiras e autorizo a CME INTELIGENTE a utilizar estes dados para análise técnica, comercial e contato relacionado à simulação realizada, conforme a{' '}
                      <button type="button" onClick={() => setView('admin-privacy')} className="text-primary underline hover:text-primary/80">Política de Privacidade</button>.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={prevStep} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
          <div className="flex items-center gap-2">{STEPS.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-muted-foreground/30'}`} />))}</div>
          {step < 3 ? (
            <Button onClick={nextStep}>Próximo <ArrowRight className="w-4 h-4 ml-2" /></Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90">{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Gerar Resultado</Button>
          )}
        </div>
      </main>
    </div>
  );
}
