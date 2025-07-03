import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { rate_limit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    await rate_limit(request);
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leaseId, amount, paymentDate, status, collectorNotes } = body;

    if (!leaseId || !amount || !paymentDate || !status) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        status,
        collectorNotes,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await rate_limit(req);
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        lease: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
