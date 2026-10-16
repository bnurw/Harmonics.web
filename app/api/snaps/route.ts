import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    if (!db) return NextResponse.json({ snaps: [] }, { status: 200 });

    const now = new Date();
    // Expiry cleanup & filter: only return active snaps where expiresAt > now
    const snaps = await db.soundSnap.findMany({
      where: {
        expiresAt: { gt: now },
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ snaps });
  } catch (error: any) {
    console.error('Fetch snaps error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch snaps.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, fileUrl, duration } = await req.json();

    if (!fileUrl || !title) {
      return NextResponse.json({ error: 'Snap title and audio file URL are required.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    // 24 hours expiry from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const snap = await db.soundSnap.create({
      data: {
        userId: user.id,
        title,
        fileUrl,
        duration: duration || 20,
        expiresAt,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, snap });
  } catch (error: any) {
    console.error('Create snap error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create snap.' }, { status: 500 });
  }
}
