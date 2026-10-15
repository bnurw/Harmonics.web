import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'audio' or 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validation
    const maxAudioSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 5 * 1024 * 1024; // 5MB

    if (type === 'audio' && file.size > maxAudioSize) {
      return NextResponse.json({ error: 'Audio file exceeds 50MB limit.' }, { status: 400 });
    }
    if (type === 'image' && file.size > maxImageSize) {
      return NextResponse.json({ error: 'Image file exceeds 5MB limit.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || (type === 'audio' ? '.mp3' : '.jpg');
    const filename = `${user.id}_${crypto.randomBytes(8).toString('hex')}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {}

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed.' }, { status: 500 });
  }
}
