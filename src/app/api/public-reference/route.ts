import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.referenceItem.findMany({
      where: { status: 'ativo' },
      select: { name: true, category: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, string[]> = {};
    for (const item of items) {
      const categoryLabel: Record<string, string> = {
        indicadores_biologicos_vapor: 'Indicadores Biológicos - Linha Vapor',
        indicadores_biologicos_plasma: 'Indicadores Biológicos - Linha Plasma VH202',
        integradores_emuladores: 'Integradores e Emuladores Químicos',
        testes_bowie_dick: 'Testes Bowie & Dick',
        testes_desafio_liberador: 'Testes Desafio e Liberador de Carga',
      };
      const label = categoryLabel[item.category] || item.category;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item.name);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Public reference error:', error);
    return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 });
  }
}
