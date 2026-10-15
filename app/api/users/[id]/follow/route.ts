import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    const { id: targetUserId } = await params;

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'You cannot follow yourself.' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: { id: existingFollow.id },
      });
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      });
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (error: any) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update follow status.' }, { status: 500 });
  }
}
