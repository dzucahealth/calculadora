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

    const items = await db.referenceItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    return NextResponse.json(items);
  } catch (error) {
    console.error('List reference items error:', error);
    return NextResponse.json({ error: 'Erro ao listar itens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const item = await db.referenceItem.create({
      data: {
        name: body.name,
        category: body.category,
        refPrice: parseFloat(body.refPrice) || 0,
        minPrice: parseFloat(body.minPrice) || 0,
        margin: parseFloat(body.margin) || 0,
        partner: body.partner || null,
        internalNotes: body.internalNotes || null,
        status: body.status || 'ativo',
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create reference item error:', error);
    return NextResponse.json({ error: 'Erro ao criar item' }, { status: 500 });
  }
}
