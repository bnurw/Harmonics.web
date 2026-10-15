import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized.' }, { status: 500 });
    }

    if (email && !token && !newPassword) {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await db.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset link sent.',
        resetToken,
      });
    }

    if (token && newPassword) {
      const user = await db.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gte: new Date() },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Password reset successfully.' });
    }

    return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during password reset.' }, { status: 500 });
  }
}
