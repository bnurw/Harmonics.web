import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { postId, trackId, content } = await req.json();

    if (!content || (!postId && !trackId)) {
      return NextResponse.json({ error: 'Content and target (postId or trackId) are required.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const comment = await db.comment.create({
      data: {
        userId: user.id,
        postId: postId || null,
        trackId: trackId || null,
        content,
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    // Create notification
    const targetAuthorId = postId 
      ? (await db.post.findUnique({ where: { id: postId }, select: { authorId: true } }))?.authorId
      : (await db.audioTrack.findUnique({ where: { id: trackId }, select: { userId: true } }))?.userId;

    if (targetAuthorId && targetAuthorId !== user.id) {
      await db.notification.create({
        data: {
          userId: targetAuthorId,
          actorId: user.id,
          type: 'COMMENT',
          title: 'New Comment',
          message: `${user.name || 'Someone'} commented on your ${postId ? 'post' : 'track'}.`,
        },
      });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create comment.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const comment = await db.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    if (comment.userId !== user.id && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to delete this comment.' }, { status: 403 });
    }

    await db.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true, message: 'Comment deleted.' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete comment.' }, { status: 500 });
  }
}
