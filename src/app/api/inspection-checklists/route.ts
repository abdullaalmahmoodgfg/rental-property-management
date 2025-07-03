import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/inspection-checklists - Create a new inspection checklist
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, items } = body;

    if (!name || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checklist = await prisma.inspectionChecklist.create({
      data: {
        name,
        items: items as any,
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error('Error creating inspection checklist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/inspection-checklists - Get all inspection checklists
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checklists = await prisma.inspectionChecklist.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(checklists, { status: 200 });
  } catch (error) {
    console.error('Error fetching inspection checklists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
