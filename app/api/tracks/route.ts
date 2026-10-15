import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ tracks: [] }, { status: 200 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const tracks = await db.audioTrack.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Fetch tracks error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tracks.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, description, fileUrl, coverArtUrl, genre, duration } = await req.json();

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'Track title and audio file URL are required.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    // Create AudioTrack
    const track = await db.audioTrack.create({
      data: {
        userId: user.id,
        title,
        description,
        fileUrl,
        coverArtUrl: coverArtUrl || 'https://picsum.photos/seed/harmonics/400/400',
        genre: genre || 'Original',
        duration: duration || 180, // default 3 mins in seconds
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    // Also create a Post so it appears on the home feed
    await db.post.create({
      data: {
        authorId: user.id,
        type: 'MUSIC',
        content: description || `New track release: ${title}`,
        title,
        songArtist: user.name || 'Creator',
        mediaUrl: fileUrl,
        coverArtUrl: track.coverArtUrl,
        duration: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`,
        genre: track.genre,
      },
    });

    return NextResponse.json({ success: true, track });
  } catch (error: any) {
    console.error('Create track error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create track.' }, { status: 500 });
  }
}
