import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';
import { getCurrentSession } from '@/lib/auth';
import { checkReportRateLimit } from '@/lib/rateLimit';

const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category_id: z.string().min(1, 'Category is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address_text: z.string().min(3, 'Address is required'),
  photos: z.array(z.string().url()).min(1, 'At least 1 photo is required').max(3, 'Maximum 3 photos allowed'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = getCurrentSession();

    const status = searchParams.get('status') || undefined;
    const category_id = searchParams.get('category_id') || undefined;
    const department_id = searchParams.get('department_id') || undefined;
    const overdueOnly = searchParams.get('overdueOnly') === 'true';
    const reporter_id = searchParams.get('reporter_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'priority';
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';

    const issues = dataStore.getIssues({
      status,
      category_id,
      department_id,
      overdueOnly,
      reporter_id,
      search,
      sortBy,
      sortOrder,
      currentUserId: session?.id,
    });

    return NextResponse.json(issues);
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to retrieve issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to submit a report.' },
        { status: 401 }
      );
    }

    // Rate limiting: 10 reports per hour
    const rateCheck = checkReportRateLimit(session.id, 10);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. You can submit up to 10 reports per hour. Please retry in ${rateCheck.resetMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createIssueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const issue = dataStore.createIssue({
      ...parsed.data,
      reporter_id: session.id,
      reporter_name: session.full_name,
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error: any) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit issue' },
      { status: 500 }
    );
  }
}
