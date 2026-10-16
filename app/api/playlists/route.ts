import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ playlists: [] }, { status: 200 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const currentUser = await getCurrentUser();

    const playlists = await db.playlist.findMany({
      where: {
        OR: [
          userId ? { userId } : { isPublic: true },
          currentUser ? { userId: currentUser.id } : {},
        ],
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        playlistTracks: {
          include: { track: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ playlists });
  } catch (error: any) {
    console.error('Fetch playlists error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch playlists.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, description, isPublic, coverArtUrl } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Playlist title is required.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const playlist = await db.playlist.create({
      data: {
        userId: user.id,
        title,
        description,
        isPublic: isPublic !== undefined ? isPublic : true,
        coverArtUrl: coverArtUrl || 'https://picsum.photos/seed/playlist/400/400',
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    return NextResponse.json({ success: true, playlist });
  } catch (error: any) {
    console.error('Create playlist error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create playlist.' }, { status: 500 });
  }
}
