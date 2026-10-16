import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!db) return NextResponse.json({ conversations: [] }, { status: 200 });

    const participants = await db.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, name: true, username: true, image: true } },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    const conversations = participants.map((p: any) => p.conversation);

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch conversations.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { recipientId } = await req.json();

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required.' }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    // Check if conversation already exists between these 2 users
    const existingParticipants = await db.conversationParticipant.findMany({
      where: { userId: user.id },
      select: { conversationId: true },
    });
    const convIds = existingParticipants.map((p: { conversationId: string }) => p.conversationId);

    const sharedConv = await db.conversationParticipant.findFirst({
      where: {
        conversationId: { in: convIds },
        userId: recipientId,
      },
      include: { conversation: true },
    });

    if (sharedConv) {
      return NextResponse.json({ success: true, conversation: sharedConv.conversation });
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: user.id },
            { userId: recipientId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, username: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create conversation.' }, { status: 500 });
  }
}
