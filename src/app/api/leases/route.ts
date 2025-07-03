import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { leaseSchema, validateRequest } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(leaseSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { unitId, tenantId, startDate, endDate, rentAmount } = validation.data;

    const existingLease = await prisma.lease.findFirst({
      where: {
        unitId,
        AND: [
          {
            startDate: {
              lte: new Date(endDate),
            },
          },
          {
            endDate: {
              gte: new Date(startDate),
            },
          },
        ],
      },
    });

    if (existingLease) {
      return new NextResponse('Overlapping lease exists for this unit', { status: 409 });
    }

    const lease = await prisma.lease.create({
      data: {
        unitId,
        tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount as any),
      },
    });

    return NextResponse.json(lease);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
