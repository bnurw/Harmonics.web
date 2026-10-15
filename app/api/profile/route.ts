import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, username, bio, location, website, image } = await req.json();

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    if (username) {
      const existingUser = await db.user.findFirst({
        where: {
          username,
          NOT: { id: user.id },
        },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 });
      }
    }

    // Update User
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : undefined,
        username: username !== undefined ? username : undefined,
        image: image !== undefined ? image : undefined,
      },
      include: { profile: true },
    });

    // Update Profile
    const updatedProfile = await db.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        website: website !== undefined ? website : undefined,
      },
      create: {
        userId: user.id,
        bio,
        location,
        website,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        profile: updatedProfile,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile.' }, { status: 500 });
  }
}
