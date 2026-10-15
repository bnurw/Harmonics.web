import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ posts: [] }, { status: 200 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const currentUser = await getCurrentUser();

    let whereClause = {};
    if (currentUser) {
      // Get users followed by current user
      const following = await db.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      });
      const followingIds = following.map((f: { followingId: string }) => f.followingId);
      followingIds.push(currentUser.id); // include own posts

      whereClause = {
        authorId: { in: followingIds },
      };
    }

    const posts = await db.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({ posts, page, limit });
  } catch (error: any) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { type, content, title, songArtist, coverArtUrl, duration, genre, mediaUrl } = await req.json();

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    if (!content && !title) {
      return NextResponse.json({ error: 'Post content or track title is required.' }, { status: 400 });
    }

    const post = await db.post.create({
      data: {
        authorId: user.id,
        type: type || 'TEXT',
        content: content || title,
        title,
        songArtist,
        coverArtUrl,
        duration,
        genre,
        mediaUrl,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post.' }, { status: 500 });
  }
}
