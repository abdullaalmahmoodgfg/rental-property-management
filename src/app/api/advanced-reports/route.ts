import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ReportingService } from '@/services/reportingService';
import { handleError, UnauthorizedError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const propertyId = searchParams.get('propertyId');

    const sDate = startDate ? new Date(startDate) : new Date(0);
    const eDate = endDate ? new Date(endDate) : new Date();

    const report = await ReportingService.generateFinancialSummary(
      sDate,
      eDate,
      propertyId || undefined
    );

    return NextResponse.json(report);
  } catch (error) {
    return handleError(error);
  }
}
