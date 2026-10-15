import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const currentUser = await getCurrentUser();

    const targetUser = await db.user.findUnique({
      where: id.startsWith('usr_') || id.length > 20 ? { id } : { username: id },
      include: {
        profile: true,
        audioTracks: {
          orderBy: { createdAt: 'desc' },
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, username: true, image: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
          },
        },
        savedItems: {
          include: {
            post: {
              include: {
                author: { select: { id: true, name: true, username: true, image: true } },
                _count: { select: { likes: true, comments: true, reposts: true } },
              },
            },
            track: true,
          },
        },
        reposts: {
          include: {
            post: {
              include: {
                author: { select: { id: true, name: true, username: true, image: true } },
                _count: { select: { likes: true, comments: true, reposts: true } },
              },
            },
            track: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            audioTracks: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    let isFollowing = false;
    if (currentUser && currentUser.id !== targetUser.id) {
      const followRecord = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUser.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        email: targetUser.email,
        image: targetUser.image,
        role: targetUser.role,
        profile: targetUser.profile,
        tracks: targetUser.audioTracks,
        notes: targetUser.posts,
        saved: targetUser.savedItems,
        reposts: targetUser.reposts,
        counts: targetUser._count,
        isFollowing,
        isOwnProfile: currentUser ? currentUser.id === targetUser.id : false,
      },
    });
  } catch (error: any) {
    console.error('Fetch user profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile.' }, { status: 500 });
  }
}
