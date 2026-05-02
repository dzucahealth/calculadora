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

    const rules = await db.offerRule.findMany({ orderBy: { minRange: 'asc' } });
    return NextResponse.json(rules);
  } catch (error) {
    console.error('List offer rules error:', error);
    return NextResponse.json({ error: 'Erro ao listar regras' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const rule = await db.offerRule.create({
      data: {
        minRange: parseFloat(body.minRange) || 0,
        maxRange: parseFloat(body.maxRange) || 0,
        benefit: body.benefit,
        internalNote: body.internalNote || null,
        showToUser: body.showToUser !== false,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Create offer rule error:', error);
    return NextResponse.json({ error: 'Erro ao criar regra' }, { status: 500 });
  }
}
