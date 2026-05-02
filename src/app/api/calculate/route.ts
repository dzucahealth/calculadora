import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consumptionData, globalMonthlySpending } = body;

    const totalCurrentCost = globalMonthlySpending || 0;

    // Fetch reference prices
    const referenceItems = await db.referenceItem.findMany({
      where: { status: 'ativo' },
    });

    const refMap: Record<string, { refPrice: number; minPrice: number; margin: number }> = {};
    for (const item of referenceItems) {
      refMap[item.name] = {
        refPrice: item.refPrice,
        minPrice: item.minPrice,
        margin: item.margin,
      };
    }

    // Calculate CME estimated cost for each item
    const itemResults: Array<{
      name: string;
      category: string;
      quantity: number;
      refUnitPrice: number;
      estimatedCost: number;
    }> = [];

    let totalCMECost = 0;

    for (const [itemName, data] of Object.entries(consumptionData)) {
      const itemData = data as { quantity: number; category: string };
      const qty = itemData.quantity || 0;
      if (qty <= 0) continue;

      const ref = refMap[itemName];
      if (!ref) continue;

      const estimatedCost = qty * ref.refPrice;
      totalCMECost += estimatedCost;

      itemResults.push({
        name: itemName,
        category: itemData.category,
        quantity: qty,
        refUnitPrice: ref.refPrice,
        estimatedCost: parseFloat(estimatedCost.toFixed(2)),
      });
    }

    const totalSaving = totalCurrentCost - totalCMECost;
    const savingPct = totalCurrentCost > 0 ? (totalSaving / totalCurrentCost) * 100 : 0;

    // Classification
    let opportunityClass = 'baixa';
    if (totalSaving > 10000) opportunityClass = 'estrategica';
    else if (totalSaving > 5000) opportunityClass = 'alta';
    else if (totalSaving > 2000) opportunityClass = 'media';

    // Offer rule matching
    const offerRules = await db.offerRule.findMany({ where: { showToUser: true } });
    let suggestedOffer = '';
    for (const rule of offerRules) {
      if (rule.maxRange === 0) {
        if (totalCMECost >= rule.minRange) suggestedOffer = rule.benefit;
      } else {
        if (totalCMECost >= rule.minRange && totalCMECost <= rule.maxRange) {
          suggestedOffer = rule.benefit;
        }
      }
    }

    // Sort items by estimated cost impact
    itemResults.sort((a, b) => b.estimatedCost - a.estimatedCost);

    return NextResponse.json({
      itemResults,
      totalCurrentCost: parseFloat(totalCurrentCost.toFixed(2)),
      totalCMECost: parseFloat(totalCMECost.toFixed(2)),
      totalSaving: parseFloat(Math.max(0, totalSaving).toFixed(2)),
      savingPercentage: parseFloat(Math.max(0, savingPct).toFixed(2)),
      opportunityClass,
      suggestedOffer,
    });
  } catch (error) {
    console.error('Calculate error:', error);
    return NextResponse.json({ error: 'Erro no cálculo' }, { status: 500 });
  }
}
