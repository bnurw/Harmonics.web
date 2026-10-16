import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const currentUser = await getCurrentUser();

    const playlist = await db.playlist.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        playlistTracks: {
          include: { track: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found.' }, { status: 404 });
    }

    if (!playlist.isPublic && (!currentUser || currentUser.id !== playlist.userId)) {
      return NextResponse.json({ error: 'This playlist is private.' }, { status: 403 });
    }

    return NextResponse.json({ playlist });
  } catch (error: any) {
    console.error('Fetch playlist error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch playlist.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { title, description, isPublic, coverArtUrl, trackIds } = await req.json();

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const playlist = await db.playlist.findUnique({ where: { id } });
    if (!playlist) return NextResponse.json({ error: 'Playlist not found.' }, { status: 404 });

    if (playlist.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this playlist.' }, { status: 403 });
    }

    const updated = await db.playlist.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        coverArtUrl: coverArtUrl !== undefined ? coverArtUrl : undefined,
      },
    });

    // If trackIds provided, update playlist tracks
    if (trackIds && Array.isArray(trackIds)) {
      await db.playlistTrack.deleteMany({ where: { playlistId: id } });
      for (let i = 0; i < trackIds.length; i++) {
        await db.playlistTrack.create({
          data: {
            playlistId: id,
            trackId: trackIds[i],
            position: i,
          },
        });
      }
    }

    return NextResponse.json({ success: true, playlist: updated });
  } catch (error: any) {
    console.error('Update playlist error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update playlist.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const playlist = await db.playlist.findUnique({ where: { id } });
    if (!playlist) return NextResponse.json({ error: 'Playlist not found.' }, { status: 404 });

    if (playlist.userId !== user.id && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to delete this playlist.' }, { status: 403 });
    }

    await db.playlist.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Playlist deleted.' });
  } catch (error: any) {
    console.error('Delete playlist error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete playlist.' }, { status: 500 });
  }
}
