import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await requireRole(['OWNER', 'ADMIN', 'MODERATOR']);
    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const [
      totalUsers,
      activeUsers,
      tracksCount,
      postsCount,
      reelsCount,
      snapsCount,
      playlistsCount,
      reportsCount,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.audioTrack.count({ where: { isRemoved: false } }),
      db.post.count({ where: { isRemoved: false } }),
      db.post.count({ where: { type: 'MUSIC', isRemoved: false } }),
      db.soundSnap.count({ where: { isRemoved: false } }),
      db.playlist.count({ where: { isRemoved: false } }),
      db.report.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        tracksCount,
        postsCount,
        reelsCount,
        snapsCount,
        playlistsCount,
        reportsCount,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized.' }, { status: 403 });
  }
}
