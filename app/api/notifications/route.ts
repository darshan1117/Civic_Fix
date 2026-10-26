import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const session = getCurrentSession();

    const targetUserId = userId || session?.id;
    if (!targetUserId) {
      return NextResponse.json([]);
    }

    const notifications = dataStore.getNotifications(targetUserId);
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const session = getCurrentSession();

    if (body.markAll && (body.userId || session?.id)) {
      dataStore.markAllNotificationsAsRead(body.userId || session!.id);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      const ok = dataStore.markNotificationAsRead(body.id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
