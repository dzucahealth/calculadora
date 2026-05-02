'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, BarChart3, RotateCcw, FileDown, Phone, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const CLASS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  baixa: { label: 'Baixa Oportunidade', color: 'bg-gray-100 text-gray-700', description: 'Identificamos oportunidades limitadas com base nos dados informados. Mesmo assim, a padronização de processos e a inclusão de soluções de rastreabilidade podem trazer ganhos indiretos significativos para a sua instituição. A equipe CME INTELIGENTE pode avaliar seu cenário completo e identificar pontos de melhoria que vão além dos consumíveis.' },
  media: { label: 'Média Oportunidade', color: 'bg-yellow-100 text-yellow-700', description: 'Identificamos oportunidades moderadas de otimização nos seus custos com consumíveis de monitoramento da CME. Além da economia direta, podemos apresentar soluções complementares como rastreabilidade, padronização de processos e gestão inteligente de estoque que potencializam ainda mais os resultados.' },
  alta: { label: 'Alta Oportunidade', color: 'bg-green-100 text-green-700', description: 'Excelente! Identificamos uma oportunidade significativa de economia nos consumíveis da sua CME. Nossa equipe técnica pode realizar uma avaliação detalhada do seu cenário e apresentar uma proposta personalizada que inclui economia direta, padronização e soluções complementares como rastreabilidade e equipamentos de apoio.' },
  estrategica: { label: 'Oportunidade Estratégica', color: 'bg-emerald-100 text-emerald-700', description: 'Potencial excepcional de economia identificado! Com base no volume de processamento e nos valores informados, sua instituição se enquadra em um cenário de parceria estratégica. Recomendamos uma reunião imediata com nossa equipe para estruturar uma proposta completa que inclua economia em consumíveis, sistema de rastreabilidade, equipamentos de apoio e condições comerciais exclusivas.' },
};

export function ResultsPage() {
  const { calculationResult, calculatorData, setView } = useAppStore();
  const result = calculationResult;
  const contact = calculatorData?.contactData;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum resultado disponível.</p>
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const classInfo = CLASS_LABELS[result.opportunityClass] || CLASS_LABELS.baixa;
  const hasSavings = result.totalSaving > 0;
  const annualSaving = result.totalSaving * 12;

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Simulação - CME INTELIGENTE</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px; }
          .header h1 { color: #0d9488; font-size: 24px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 12px; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
          .card { background: #f8f9fa; border-radius: 8px; padding: 15px; }
          .card-label { font-size: 11px; color: #666; margin-bottom: 4px; }
          .card-value { font-size: 22px; font-weight: bold; }
          .card-value.positive { color: #059669; }
          .contact-info { margin-bottom: 20px; font-size: 13px; }
          .contact-info h2 { font-size: 16px; margin-bottom: 10px; color: #0d9488; }
          .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
          th { background: #f0fdfa; padding: 8px; text-align: left; border-bottom: 2px solid #0d9488; }
          td { padding: 8px; border-bottom: 1px solid #eee; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
          .disclaimer { background: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #92400e; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CME INTELIGENTE</h1>
          <p>Calculadora Inteligente de Consumíveis da CME</p>
          <p style="margin-top: 10px;">Relatório de Simulação — ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        ${contact ? `<div class="contact-info"><h2>Dados do Contato</h2><div class="contact-grid">
          <div><strong>Nome:</strong> ${contact.fullName}</div>
          <div><strong>E-mail:</strong> ${contact.email}</div>
          <div><strong>WhatsApp:</strong> ${contact.whatsapp}</div>
          <div><strong>Instituição:</strong> ${contact.institution}</div>
          <div><strong>Cidade/UF:</strong> ${contact.city}/${contact.state}</div>
          ${contact.sterilizedPackages ? `<div><strong>Pacotes/mês:</strong> ${contact.sterilizedPackages}</div>` : ''}
          ${contact.incubatorCount ? `<div><strong>Incubadoras:</strong> ${contact.incubatorCount} (${contact.incubatorType === 'propria' ? 'Próprias' : contact.incubatorType === 'comodato' ? 'Comodato' : '—'})</div>` : ''}
        </div></div>` : ''}
        <div class="summary">
          <div class="card"><div class="card-label">Gasto Mensal Informado</div><div class="card-value">${formatCurrency(result.totalCurrentCost)}</div></div>
          <div class="card"><div class="card-label">Custo Estimado CME INTELIGENTE</div><div class="card-value">${formatCurrency(result.totalCMECost)}</div></div>
          <div class="card"><div class="card-label">Economia Mensal Estimada</div><div class="card-value positive">${formatCurrency(result.totalSaving)}</div></div>
          <div class="card"><div class="card-label">Economia Anual Estimada</div><div class="card-value positive">${formatCurrency(annualSaving)}</div></div>
        </div>
        ${hasSavings ? `<p style="font-size: 14px; color: #059669; font-weight: bold; margin-bottom: 15px;">Economia de ${result.savingPercentage.toFixed(1)}% identificada</p>` : ''}
        <table>
          <thead><tr><th>Item</th><th style="text-align:right">Qtd/mês</th><th style="text-align:right">Valor Ref. CME</th><th style="text-align:right">Custo Estimado</th></tr></thead>
          <tbody>
            ${result.itemResults.map((item) => `<tr>
              <td>${item.name}</td>
              <td style="text-align:right">${item.quantity}</td>
              <td style="text-align:right">${formatCurrency(item.refUnitPrice)}</td>
              <td style="text-align:right">${formatCurrency(item.estimatedCost)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        ${result.suggestedOffer ? `<div class="card" style="background: #f0fdfa; border: 1px solid #0d9488; margin-top: 20px;"><div class="card-label" style="color: #0d9488; font-weight: bold;">Oferta Sugerida</div><p style="margin-top: 8px; font-size: 14px;">${result.suggestedOffer}</p></div>` : ''}
        <div class="disclaimer">
          <strong>Importante:</strong> Esta simulação apresenta uma estimativa preliminar de consumo e oportunidade de otimização em testes e indicadores para CME. A análise definitiva depende da validação técnica da rotina, protocolos internos, equipamentos utilizados, perfil de carga e condições comerciais aplicáveis. A equipe CME INTELIGENTE poderá realizar uma devolutiva técnica para discutir oportunidades de economia, padronização, rastreabilidade e melhoria de controle de processo.
        </div>
        <div class="footer">
          <p>CME INTELIGENTE — Gestão Inteligente de Esterilização</p>
          <p>Este relatório é confidencial e destinado exclusivamente ao destinatário.</p>
          <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-cme.png" alt="CME INTELIGENTE" width={40} height={40} className="h-10 w-auto" />
            <div>
              <h1 className="text-sm font-bold text-primary">CME INTELIGENTE</h1>
              <p className="text-xs text-muted-foreground">Resultado da Simulação</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Início
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          {/* Classification Badge */}
          <div className="text-center">
            <Badge className={`${classInfo.color} px-4 py-1.5 text-sm font-medium`}>{classInfo.label}</Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Gasto Mensal Informado</p>
                <p className="text-xl font-bold">{formatCurrency(result.totalCurrentCost)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Custo Estimado CME</p>
                <p className="text-xl font-bold">{formatCurrency(result.totalCMECost)}</p>
              </CardContent>
            </Card>
            <Card className={hasSavings ? 'border-green-300 bg-green-50/50' : ''}>
              <CardContent className="p-4 text-center">
                <TrendingDown className={`w-8 h-8 mx-auto mb-2 ${hasSavings ? 'text-green-600' : 'text-muted-foreground'}`} />
                <p className="text-xs text-muted-foreground mb-1">Economia Mensal</p>
                <p className={`text-xl font-bold ${hasSavings ? 'text-green-600' : ''}`}>{formatCurrency(result.totalSaving)}</p>
              </CardContent>
            </Card>
            <Card className={hasSavings ? 'border-green-300 bg-green-50/50' : ''}>
              <CardContent className="p-4 text-center">
                <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${hasSavings ? 'text-green-600' : 'text-muted-foreground'}`} />
                <p className="text-xs text-muted-foreground mb-1">% Economia</p>
                <p className={`text-xl font-bold ${hasSavings ? 'text-green-600' : ''}`}>{result.savingPercentage.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Annual savings highlight */}
          {hasSavings && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Economia anual estimada</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(annualSaving)}</p>
              </CardContent>
            </Card>
          )}

          {/* Commercial message */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Análise da Oportunidade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{classInfo.description}</p>
              {result.suggestedOffer && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-1">Oferta Especial:</p>
                  <p className="text-sm">{result.suggestedOffer}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer when no savings */}
          {!hasSavings && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <p className="text-sm text-amber-800 leading-relaxed">
                  A simulação não identificou economia direta relevante apenas na comparação de consumíveis com base nos valores informados. Ainda assim, pode haver oportunidade de ganho por padronização, rastreabilidade, redução de perdas, melhor gestão de estoque, controle de validade e aumento da segurança do processo. Entre em contato para uma avaliação personalizada da equipe CME INTELIGENTE.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Items breakdown - estimated CME costs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estimativa de Custo por Item (Referência CME INTELIGENTE)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Item</th>
                      <th className="text-right py-2 px-2 font-medium">Qtd/mês</th>
                      <th className="text-right py-2 px-2 font-medium">Valor Ref.</th>
                      <th className="text-right py-2 pl-2 font-medium">Custo Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.itemResults.map((item) => (
                      <tr key={item.name} className="border-t">
                        <td className="py-3 pr-4">{item.name}</td>
                        <td className="text-right py-3 px-2">{item.quantity}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(item.refUnitPrice)}</td>
                        <td className="text-right py-3 pl-2 font-medium">{formatCurrency(item.estimatedCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Final disclaimer */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Importante:</strong> Esta simulação apresenta uma estimativa preliminar de consumo e oportunidade de otimização em testes e indicadores para CME. A análise definitiva depende da validação técnica da rotina, protocolos internos, equipamentos utilizados, perfil de carga e condições comerciais aplicáveis. A equipe CME INTELIGENTE poderá realizar uma devolutiva técnica para discutir oportunidades de economia, padronização, rastreabilidade e melhoria de controle de processo.
              </p>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contact?.wantsFeedback && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Solicitar Devolutiva
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={handlePrintReport}>
              <FileDown className="w-4 h-4 mr-2" />
              Baixar Relatório
            </Button>
            <Button variant="outline" size="lg" onClick={() => setView('calculator')}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Nova Simulação
            </Button>
          </div>
        </motion.div>
      </main>

      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CME INTELIGENTE. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
