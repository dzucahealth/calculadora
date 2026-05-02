import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return validateToken(authHeader.slice(7));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    const history = await db.contactHistory.create({
      data: {
        leadId: id,
        summary: body.summary,
        objections: body.objections || null,
        nextStep: body.nextStep || null,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        responsible: admin.name,
      },
    });

    return NextResponse.json(history, { status: 201 });
  } catch (error) {
    console.error('Create history error:', error);
    return NextResponse.json({ error: 'Erro ao criar histórico' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;

    const history = await db.contactHistory.findMany({
      where: { leadId: id },
      orderBy: { contactDate: 'desc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
