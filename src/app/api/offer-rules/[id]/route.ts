import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

function getAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return validateToken(authHeader.slice(7));
}

export async function PATCH(
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

    const rule = await db.offerRule.update({
      where: { id },
      data: {
        ...(body.minRange !== undefined && { minRange: parseFloat(body.minRange) }),
        ...(body.maxRange !== undefined && { maxRange: parseFloat(body.maxRange) }),
        ...(body.benefit && { benefit: body.benefit }),
        ...(body.internalNote !== undefined && { internalNote: body.internalNote }),
        ...(body.showToUser !== undefined && { showToUser: body.showToUser }),
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Update offer rule error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar regra' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;

    await db.offerRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete offer rule error:', error);
    return NextResponse.json({ error: 'Erro ao excluir regra' }, { status: 500 });
  }
}
