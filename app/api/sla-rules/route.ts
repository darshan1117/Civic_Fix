import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';
import { getCurrentSession } from '@/lib/auth';

const updateSLASchema = z.object({
  category_id: z.string().min(1),
  sla_hours: z.number().int().min(1, 'SLA must be at least 1 hour').max(1000),
});

export async function GET() {
  try {
    const rules = dataStore.slaRules.map((rule) => {
      const cat = dataStore.categories.find((c) => c.id === rule.category_id);
      return {
        ...rule,
        category_name: cat?.name || 'Unknown',
        severity_weight: cat?.severity_weight || 5,
      };
    });
    return NextResponse.json(rules);
  } catch (error: any) {
    console.error('Error fetching SLA rules:', error);
    return NextResponse.json({ error: 'Failed to retrieve SLA rules' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getCurrentSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can update SLA configurations.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateSLASchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = dataStore.updateSLARule(parsed.data.category_id, parsed.data.sla_hours);
    if (!updated) {
      return NextResponse.json({ error: 'SLA rule not found for category' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating SLA rule:', error);
    return NextResponse.json({ error: 'Failed to update SLA rule' }, { status: 500 });
  }
}
