import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { rate_limit } from '@/lib/rate-limit';

function validatePropertyInput(name: unknown, address: unknown) {
  if (typeof name !== 'string' || typeof address !== 'string') {
    return 'Name and address must be strings.';
  }
  if (name.trim().length < 3 || name.length > 100) {
    return 'Property name must be between 3 and 100 characters.';
  }
  if (address.trim().length < 5 || address.length > 200) {
    return 'Address must be between 5 and 200 characters.';
  }
  // Optionally: add regex for allowed characters
  return null;
}

export async function GET(req: Request) {
  try {
    await rate_limit(req);
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const properties = await prisma.property.findMany();
    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address } = body;
    const validationError = validatePropertyInput(name, address);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }
    const property = await prisma.property.create({
      data: {
        name: name.trim(),
        address: address.trim(),
      },
    });
    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
