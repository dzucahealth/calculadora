import { NextRequest, NextResponse } from 'next/server';
import { validateToken, revokeToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    const admin = validateToken(token);

    if (!admin) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({ valid: true, admin });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    if (token) revokeToken(token);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao fazer logout' }, { status: 500 });
  }
}
