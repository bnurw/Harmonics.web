import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['OWNER', 'ADMIN', 'MODERATOR']);
    if (!db) return NextResponse.json({ reports: [] }, { status: 200 });

    const reports = await db.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized.' }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireRole(['OWNER', 'ADMIN', 'MODERATOR']);
    const { reportId, status, removeContent, reason } = await req.json();

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required.' }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });

    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: { status: status || 'RESOLVED' },
    });

    // If moderator requested to remove content
    if (removeContent && report.targetId) {
      if (report.targetType === 'POST') {
        await db.post.updateMany({ where: { id: report.targetId }, data: { isRemoved: true } });
      } else if (report.targetType === 'TRACK') {
        await db.audioTrack.updateMany({ where: { id: report.targetId }, data: { isRemoved: true } });
      } else if (report.targetType === 'COMMENT') {
        await db.comment.updateMany({ where: { id: report.targetId }, data: { isRemoved: true } });
      } else if (report.targetType === 'PLAYLIST') {
        await db.playlist.updateMany({ where: { id: report.targetId }, data: { isRemoved: true } });
      } else if (report.targetType === 'SNAP') {
        await db.soundSnap.updateMany({ where: { id: report.targetId }, data: { isRemoved: true } });
      }
    }

    // Audit log
    await db.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: `RESOLVE_REPORT_${status || 'RESOLVED'}`,
        details: { reportId, targetType: report.targetType, targetId: report.targetId, reason },
      },
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error: any) {
    console.error('Admin report update error:', error);
    return NextResponse.json({ error: error.message || 'Action failed.' }, { status: 500 });
  }
}
