import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, checklistId, inspectionDate, results, notes } = body;

    if (!propertyId || !checklistId || !inspectionDate || !results) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const inspection = await prisma.inspection.create({
      data: {
        propertyId,
        checklistId,
        inspectionDate: new Date(inspectionDate),
        results: results as any,
        notes,
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inspections = await prisma.inspection.findMany({
      include: {
        property: true,
        checklist: true,
      },
      orderBy: {
        inspectionDate: 'desc',
      },
    });
    return NextResponse.json(inspections);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
