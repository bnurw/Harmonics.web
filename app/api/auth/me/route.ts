import { NextResponse } from 'next/server';
import { getCurrentUser, ensureOwnerAccountExists } from '@/lib/auth';

export async function GET() {
  try {
    await ensureOwnerAccountExists();
    const user = await getCurrentUser();
    return NextResponse.json({ user: user || null });
  } catch (error: any) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
