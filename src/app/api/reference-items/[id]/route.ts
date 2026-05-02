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

    const item = await db.referenceItem.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.refPrice !== undefined && { refPrice: parseFloat(body.refPrice) }),
        ...(body.minPrice !== undefined && { minPrice: parseFloat(body.minPrice) }),
        ...(body.margin !== undefined && { margin: parseFloat(body.margin) }),
        ...(body.partner !== undefined && { partner: body.partner }),
        ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Update reference item error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
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

    await db.referenceItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reference item error:', error);
    return NextResponse.json({ error: 'Erro ao excluir item' }, { status: 500 });
  }
}
