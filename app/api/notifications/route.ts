import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!db) return NextResponse.json({ notifications: [] }, { status: 200 });

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { notificationId, markAllRead } = await req.json();

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notifications.' }, { status: 500 });
  }
}
