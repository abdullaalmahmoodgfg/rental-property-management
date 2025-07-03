import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ReportGenerator, CSVExporter } from '@/lib/reporting';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const propertyId = searchParams.get('propertyId');

  if (!reportType) {
    return NextResponse.json({ error: 'Missing report type' }, { status: 400 });
  }

  try {
    const reportGenerator = ReportGenerator.getInstance();
    let reportData;

    const sDate = startDate ? new Date(startDate) : new Date(0);
    const eDate = endDate ? new Date(endDate) : new Date();

    switch (reportType) {
      case 'payment_history':
        reportData = await reportGenerator.generatePaymentReport(sDate, eDate, propertyId || undefined);
        break;
      case 'occupancy':
        reportData = await reportGenerator.generateOccupancyReport();
        break;
      case 'expense_report':
        reportData = await reportGenerator.generateExpenseReport(sDate, eDate, propertyId || undefined);
        break;
      case 'financial_summary':
        reportData = await reportGenerator.generateFinancialSummary(sDate, eDate, propertyId || undefined);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return CSVExporter.createCSVResponse(reportData, `${reportType}_report`);
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    return NextResponse.json({ error: `Failed to generate ${reportType} report` }, { status: 500 });
  }
}
