import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    if (!db) return NextResponse.json({ reels: [] }, { status: 200 });

    const reels = await db.post.findMany({
      where: {
        type: 'MUSIC',
        mediaUrl: { not: null },
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reels });
  } catch (error: any) {
    console.error('Fetch reels error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reels.' }, { status: 500 });
  }
}
