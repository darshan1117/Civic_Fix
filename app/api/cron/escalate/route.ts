import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  return handleEscalation(request);
}

export async function POST(request: NextRequest) {
  return handleEscalation(request);
}

async function handleEscalation(request: NextRequest) {
  try {
    const configuredSecret = process.env.CRON_SECRET || 'civicfix-cron-secret-demo-key';
    const authHeader = request.headers.get('authorization');
    const xCronSecret = request.headers.get('x-cron-secret');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const providedSecret = bearerToken || xCronSecret;
    const session = getCurrentSession();

    // Authorized if provided secret matches OR if an authenticated admin calls it
    const isAuthorizedBySecret = providedSecret === configuredSecret;
    const isAuthorizedAdmin = session?.role === 'admin';

    if (!isAuthorizedBySecret && !isAuthorizedAdmin) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Invalid or missing CRON_SECRET header and no admin session found.',
        },
        { status: 401 }
      );
    }

    const result = dataStore.runEscalationJob();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: process.env.SLA_TIME_UNIT === 'minutes' ? 'demo (minutes)' : 'production (hours)',
      escalatedCount: result.escalatedCount,
      details: result.details,
    });
  } catch (error: any) {
    console.error('Error running escalation job:', error);
    return NextResponse.json(
      { error: 'Internal server error executing SLA escalation check.' },
      { status: 500 }
    );
  }
}
