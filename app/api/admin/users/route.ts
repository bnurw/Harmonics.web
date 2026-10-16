import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['OWNER', 'ADMIN', 'MODERATOR']);
    if (!db) return NextResponse.json({ users: [] }, { status: 200 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const users = await db.user.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
        ],
      } : undefined,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized.' }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireRole(['OWNER', 'ADMIN', 'MODERATOR']);
    const { userId, status, role, reason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    // Enforce strict authorization: Only OWNER can assign or change roles
    if (role && role !== targetUser.role) {
      if (admin.role !== 'OWNER') {
        return NextResponse.json({ error: 'Forbidden: Only the Owner can manage privileged roles.' }, { status: 403 });
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        status: status !== undefined ? status : undefined,
        role: role !== undefined ? role : undefined,
      },
    });

    // Record moderation action & audit log
    await db.moderationAction.create({
      data: {
        moderatorId: admin.id,
        targetUserId: userId,
        actionType: role ? `ROLE_CHANGE_${role}` : `STATUS_${status}`,
        notes: reason || 'Administrative moderation update',
      },
    });

    await db.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: role ? `CHANGE_ROLE_${role}` : `CHANGE_STATUS_${status}`,
        details: { targetUserId: userId, reason },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: error.message || 'Action failed.' }, { status: 500 });
  }
}
