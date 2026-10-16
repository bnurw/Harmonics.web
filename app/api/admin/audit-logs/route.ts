import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['OWNER', 'ADMIN', 'MODERATOR']);
    if (!db) return NextResponse.json({ logs: [] }, { status: 200 });

    const logs = await db.adminAuditLog.findMany({
      include: {
        admin: { select: { id: true, name: true, username: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Admin audit logs error:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized.' }, { status: 403 });
  }
}
