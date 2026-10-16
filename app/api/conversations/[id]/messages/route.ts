import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: conversationId } = await params;

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    // Verify user is a participant
    const participant = await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized access to conversation.' }, { status: 403 });
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: conversationId } = await params;
    const { content, attachmentUrl } = await req.json();

    if (!content && !attachmentUrl) {
      return NextResponse.json({ error: 'Message content or attachment is required.' }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const participant = await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized access to conversation.' }, { status: 403 });
    }

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content || '',
        attachmentUrl: attachmentUrl || null,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    // Update conversation updatedAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify other participant
    const otherParticipants = await db.conversationParticipant.findMany({
      where: {
        conversationId,
        NOT: { userId: user.id },
      },
    });

    for (const p of otherParticipants) {
      await db.notification.create({
        data: {
          userId: p.userId,
          actorId: user.id,
          type: 'MESSAGE',
          title: 'New Message',
          message: `${user.name || 'Someone'} sent you a message.`,
        },
      });
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}
