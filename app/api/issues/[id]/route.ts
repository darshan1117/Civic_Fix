import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';
import { getCurrentSession } from '@/lib/auth';
import { IssueStatus } from '@/lib/types';

const updateStatusSchema = z.object({
  status: z.enum([
    'Submitted',
    'Acknowledged',
    'In Progress',
    'Resolved',
    'Closed',
    'Rejected',
    'Reopened',
  ]),
  note: z.string().optional(),
  proofPhotoUrl: z.string().url().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getCurrentSession();
    const issue = dataStore.getIssueById(params.id, session?.id);

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error: any) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status, note, proofPhotoUrl } = parsed.data;

    const result = dataStore.updateIssueStatus({
      issueId: params.id,
      toStatus: status as IssueStatus,
      actor: {
        id: session.id,
        role: session.role,
        full_name: session.full_name,
        department_id: session.department_id,
        created_at: new Date().toISOString(),
      },
      note,
      proofPhotoUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.issue);
  } catch (error: any) {
    console.error('Error updating issue status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update issue status' },
      { status: 500 }
    );
  }
}
