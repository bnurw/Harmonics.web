import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ users: [], tracks: [], playlists: [], posts: [] }, { status: 200 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all'; // all, users, tracks, playlists, posts

    if (!query) {
      return NextResponse.json({ users: [], tracks: [], playlists: [], posts: [] });
    }

    const searchTerm = query.toLowerCase();

    let users: any[] = [];
    let tracks: any[] = [];
    let playlists: any[] = [];
    let posts: any[] = [];

    if (filter === 'all' || filter === 'users') {
      users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, username: true, image: true, role: true },
        take: 10,
      });
    }

    if (filter === 'all' || filter === 'tracks') {
      tracks = await db.audioTrack.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { genre: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        take: 10,
      });
    }

    if (filter === 'all' || filter === 'playlists') {
      playlists = await db.playlist.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        take: 10,
      });
    }

    if (filter === 'all' || filter === 'posts') {
      posts = await db.post.findMany({
        where: {
          content: { contains: searchTerm, mode: 'insensitive' },
        },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { likes: true, comments: true, reposts: true } },
        },
        take: 10,
      });
    }

    return NextResponse.json({ users, tracks, playlists, posts, query });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed.' }, { status: 500 });
  }
}
