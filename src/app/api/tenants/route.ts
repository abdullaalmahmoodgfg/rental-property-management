import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { tenantSchema, validateRequest } from '@/lib/validation';
import { rate_limit } from '@/lib/rate-limit';

export async function GET() {
  const tenants = await prisma.tenant.findMany();
  return NextResponse.json(tenants);
}

export async function POST(request: Request) {
  try {
    await rate_limit(request);
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(tenantSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, phone } = validation.data;

    const existingTenant = await prisma.tenant.findUnique({
      where: { email },
    });

    if (existingTenant) {
      return new NextResponse('Tenant with this email already exists', { status: 409 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        email,
        phone,
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
