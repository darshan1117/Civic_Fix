import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { getCurrentSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to upvote.' },
        { status: 401 }
      );
    }

    const result = dataStore.toggleUpvote(params.id, session.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error toggling upvote:', error);
    return NextResponse.json({ error: 'Failed to process upvote' }, { status: 500 });
  }
}
