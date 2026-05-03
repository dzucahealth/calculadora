import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return validateToken(token);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { consumptionData, globalMonthlySpending, itemResults, contactData } = body;

    const totalCurrentCost = globalMonthlySpending || 0;
    let cmeTotalCost = 0;

    if (itemResults && itemResults.length > 0) {
      for (const item of itemResults) {
        cmeTotalCost += item.estimatedCost || 0;
      }
    }

    const estimatedSaving = totalCurrentCost - cmeTotalCost;
    const savingPercentage = totalCurrentCost > 0 ? (estimatedSaving / totalCurrentCost) * 100 : 0;

    // Classification
    let opportunityClass = 'baixa';
    if (estimatedSaving > 10000) opportunityClass = 'estrategica';
    else if (estimatedSaving > 5000) opportunityClass = 'alta';
    else if (estimatedSaving > 2000) opportunityClass = 'media';

    // Find matching offer rule
    const offerRules = await db.offerRule.findMany({ where: { showToUser: true } });
    let suggestedOffer = '';
    for (const rule of offerRules) {
      if (rule.maxRange === 0) {
        if (cmeTotalCost >= rule.minRange) suggestedOffer = rule.benefit;
      } else {
        if (cmeTotalCost >= rule.minRange && cmeTotalCost <= rule.maxRange) {
          suggestedOffer = rule.benefit;
        }
      }
    }

    // Create lead
    const lead = await db.lead.create({
      data: {
        fullName: contactData.fullName,
        email: contactData.email,
        whatsapp: contactData.whatsapp,
        role: contactData.role || '',
        institution: contactData.institution || '',
        city: contactData.city || '',
        state: contactData.state || '',
        institutionType: contactData.institutionType || 'outro',
        sterilizedPackages: contactData.sterilizedPackages || null,
        incubatorCount: contactData.incubatorCount || null,
        incubatorType: contactData.incubatorType || null,
        hasOwnCME: contactData.hasOwnCME || false,
        hasTraceability: contactData.hasTraceability || false,
        wantsFeedback: contactData.wantsFeedback !== false,
        lgpdConsent: true,
        currentTotalCost: parseFloat(totalCurrentCost.toFixed(2)),
        cmeTotalCost: parseFloat(cmeTotalCost.toFixed(2)),
        estimatedSaving: parseFloat(Math.max(0, estimatedSaving).toFixed(2)),
        savingPercentage: parseFloat(Math.max(0, savingPercentage).toFixed(2)),
        opportunityClass,
        suggestedOffer,
        consumptionData: JSON.stringify(consumptionData || {}),
        currentValuesData: JSON.stringify({ globalMonthlySpending: totalCurrentCost }),
        itemResultsData: JSON.stringify(itemResults || []),
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      currentTotalCost: lead.currentTotalCost,
      cmeTotalCost: lead.cmeTotalCost,
      estimatedSaving: lead.estimatedSaving,
      savingPercentage: lead.savingPercentage,
      opportunityClass,
      suggestedOffer,
      itemResults,
    });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: 'Erro ao criar lead' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const classification = searchParams.get('classification');
    const state = searchParams.get('state');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (classification) where.opportunityClass = classification;
    if (state) where.state = state;

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total, page, limit });
  } catch (error) {
    console.error('List leads error:', error);
    return NextResponse.json({ error: 'Erro ao listar leads' }, { status: 500 });
  }
}
