import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';

const duplicateCheckSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius_meters: z.number().optional().default(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = duplicateCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid coordinates or category parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { category_id, lat, lng, radius_meters } = parsed.data;
    const matches = dataStore.findNearbyDuplicates(category_id, lat, lng, radius_meters);

    return NextResponse.json({
      hasDuplicates: matches.length > 0,
      count: matches.length,
      radiusMeters: radius_meters,
      matches,
    });
  } catch (error: any) {
    console.error('Error checking duplicate issues:', error);
    return NextResponse.json(
      { error: 'Internal server error checking duplicates' },
      { status: 500 }
    );
  }
}
