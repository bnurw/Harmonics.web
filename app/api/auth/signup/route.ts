import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, birthday, email, password, termsAccepted } = await req.json();

    if (!email || !password || !name || !birthday) {
      return NextResponse.json({ error: 'All fields (name, birthday, email, password) are required.' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: 'You must accept the terms and agreement to sign up.' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await db.user.create({
      data: {
        name,
        birthday: new Date(birthday),
        email,
        passwordHash,
        role: 'USER',
        termsAccepted: true,
        verificationToken,
      },
    });

    await db.profile.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      verificationToken,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during signup.' }, { status: 500 });
  }
}
