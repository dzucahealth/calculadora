import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return validateToken(authHeader.slice(7));
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const totalLeads = await db.lead.count();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const leadsThisMonth = await db.lead.count({
      where: { createdAt: { gte: firstDayOfMonth } },
    });

    // Leads por estado
    const leadsByStateRaw = await db.lead.groupBy({
      by: ['state'],
      _count: { state: true },
      orderBy: { _count: { state: 'desc' } },
      take: 10,
    });
    const leadsByState = leadsByStateRaw.map((item) => ({
      state: item.state,
      count: item._count.state,
    }));

    // Leads por tipo de instituição
    const leadsByTypeRaw = await db.lead.groupBy({
      by: ['institutionType'],
      _count: { institutionType: true },
    });
    const institutionTypeLabels: Record<string, string> = {
      hospital: 'Hospital',
      clinica: 'Clínica',
      hospital_dia: 'Hospital Dia',
      processadora: 'Empresa Processadora',
      maternidade: 'Maternidade',
      odontologia: 'Odontologia',
      outro: 'Outro',
    };
    const leadsByType = leadsByTypeRaw.map((item) => ({
      type: institutionTypeLabels[item.institutionType] || item.institutionType,
      count: item._count.institutionType,
    }));

    // Leads por mês (últimos 12 meses)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const leadsByMonthRaw = await db.lead.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });
    const leadsByMonth: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const count = leadsByMonthRaw.filter(
        (l) =>
          l.createdAt.getFullYear() === d.getFullYear() &&
          l.createdAt.getMonth() === d.getMonth()
      ).length;
      leadsByMonth.push({ month: monthLabel, count });
    }

    // Totais de economia
    const allLeads = await db.lead.findMany({
      select: {
        currentTotalCost: true,
        cmeTotalCost: true,
        estimatedSaving: true,
        opportunityClass: true,
        status: true,
      },
    });

    const totalSavings = allLeads.reduce((sum, l) => sum + (l.estimatedSaving || 0), 0);
    const totalCurrentCost = allLeads.reduce((sum, l) => sum + (l.currentTotalCost || 0), 0);
    const totalCMECost = allLeads.reduce((sum, l) => sum + (l.cmeTotalCost || 0), 0);

    // Classificações
    const altaOportunidade = allLeads.filter((l) => l.opportunityClass === 'alta').length;
    const estrategicas = allLeads.filter((l) => l.opportunityClass === 'estrategica').length;
    const mediaOportunidade = allLeads.filter((l) => l.opportunityClass === 'media').length;
    const baixaOportunidade = allLeads.filter((l) => l.opportunityClass === 'baixa').length;

    // Taxa de conversão
    const ganhos = allLeads.filter((l) => l.status === 'ganho').length;
    const conversionRate = totalLeads > 0 ? (ganhos / totalLeads) * 100 : 0;

    // Ticket médio
    const avgTicket = totalLeads > 0 ? totalCMECost / totalLeads : 0;

    // Ranking de itens com maior diferença de preço
    const referenceItems = await db.referenceItem.findMany({ where: { status: 'ativo' } });

    return NextResponse.json({
      totalLeads,
      leadsThisMonth,
      leadsByState,
      leadsByType,
      leadsByMonth,
      totalSavings: parseFloat(totalSavings.toFixed(2)),
      totalCurrentCost: parseFloat(totalCurrentCost.toFixed(2)),
      totalCMECost: parseFloat(totalCMECost.toFixed(2)),
      altaOportunidade,
      estrategicas,
      mediaOportunidade,
      baixaOportunidade,
      ganhos,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      avgTicket: parseFloat(avgTicket.toFixed(2)),
      referenceItems,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard' }, { status: 500 });
  }
}
