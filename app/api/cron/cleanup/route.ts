import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'harmonics-cron-secret-2026';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger.' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const now = new Date();

    // Delete or mark expired SoundSnaps as removed
    const result = await db.soundSnap.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up expired SoundSnaps.`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ error: error.message || 'Cleanup failed.' }, { status: 500 });
  }
}
