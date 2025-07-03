import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { rate_limit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return new NextResponse('Missing name', { status: 400 });
  }

  const provider = await prisma.utilityProvider.create({
    data: {
      name,
    },
  });

  return NextResponse.json(provider);
}

export async function GET(req: Request) {
  try {
    await rate_limit(req);
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providers = await prisma.utilityProvider.findMany({
      include: {
        readings: {
          orderBy: {
            readingDate: 'desc',
          },
        },
      },
    });
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
