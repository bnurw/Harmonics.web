import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { postId, trackId } = await req.json();

    if (!postId && !trackId) {
      return NextResponse.json({ error: 'postId or trackId is required.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const existingLike = await db.like.findFirst({
      where: {
        userId: user.id,
        OR: [
          postId ? { postId } : {},
          trackId ? { trackId } : {},
        ],
      },
    });

    if (existingLike) {
      await db.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ success: true, liked: false });
    } else {
      await db.like.create({
        data: {
          userId: user.id,
          postId: postId || null,
          trackId: trackId || null,
        },
      });

      // Create notification for author
      const targetAuthorId = postId 
        ? (await db.post.findUnique({ where: { id: postId }, select: { authorId: true } }))?.authorId
        : (await db.audioTrack.findUnique({ where: { id: trackId }, select: { userId: true } }))?.userId;

      if (targetAuthorId && targetAuthorId !== user.id) {
        await db.notification.create({
          data: {
            userId: targetAuthorId,
            actorId: user.id,
            type: 'LIKE',
            title: 'New Like',
            message: `${user.name || 'Someone'} liked your ${postId ? 'post' : 'track'}.`,
          },
        });
      }

      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error: any) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle like.' }, { status: 500 });
  }
}
