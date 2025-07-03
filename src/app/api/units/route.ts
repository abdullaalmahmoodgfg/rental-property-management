import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { rate_limit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    await rate_limit(request);
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, propertyId } = body;

    if (!name || !propertyId) {
      return new NextResponse('Missing name or propertyId', { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: {
        name,
        propertyId,
      },
    });

    return NextResponse.json(unit);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
