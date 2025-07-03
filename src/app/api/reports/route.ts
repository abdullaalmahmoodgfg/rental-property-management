import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { ReportGenerator } from '@/lib/reporting';
import { handleError, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { rate_limit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    await rate_limit(req);
    const session = await getServerSession();

    if (!session || session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('You must be an admin to access reports.');
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const propertyId = searchParams.get('propertyId');
    const withinDaysStr = searchParams.get('withinDays');

    if (!reportType) {
      throw new BadRequestError('Report type is required.');
    }

    const reportGenerator = ReportGenerator.getInstance();
    let reportData;

    const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    switch (reportType) {
      case 'payment_history':
        reportData = await reportGenerator.generatePaymentReport(startDate, endDate, propertyId ?? undefined);
        break;
      case 'occupancy':
        reportData = await reportGenerator.generateOccupancyReport();
        break;
      case 'expense_report':
        reportData = await reportGenerator.generateExpenseReport(startDate, endDate, propertyId ?? undefined);
        break;
      case 'financial_summary':
        reportData = await reportGenerator.generateFinancialSummary(startDate, endDate, propertyId ?? undefined);
        break;
      case 'financial_statement':
        reportData = await reportGenerator.generateFinancialStatement(startDate, endDate, propertyId ?? undefined);
        break;
      case 'rent_roll':
        if (!propertyId) throw new BadRequestError('Property ID is required for rent roll report.');
        reportData = await reportGenerator.generateRentRollReport(propertyId);
        break;
      case 'lease_expirations':
        const withinDays = withinDaysStr ? parseInt(withinDaysStr, 10) : 30;
        if (isNaN(withinDays)) throw new BadRequestError('Invalid value for withinDays.');
        reportData = await reportGenerator.generateLeaseExpirationsReport(withinDays);
        break;
      case 'tenant_directory':
        reportData = await reportGenerator.generateTenantDirectoryReport(propertyId ?? undefined);
        break;
      case 'performance_dashboard':
        reportData = await reportGenerator.generatePerformanceDashboard(propertyId ?? undefined);
        break;
      default:
        throw new BadRequestError('Invalid report type.');
    }

    return NextResponse.json(reportData, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
