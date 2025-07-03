import prisma from '@/lib/prisma';
import Link from 'next/link';

async function getUnit(id: string) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      leases: {
        include: {
          tenant: true,
          payments: true,
        },
      },
    },
  });
  return unit;
}

export default async function UnitPage({ params }: { params: { id: string } }) {
  const unit = await getUnit(params.id);

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{unit.name}</h1>
        <Link href={`/units/${unit.id}/lease/new`} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Add Lease
        </Link>
      </div>
      <p className="mb-4">Property: {unit.property.name}</p>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Leases</h2>
        {unit.leases.length > 0 ? (
          <div className="space-y-4">
            {unit.leases.map((lease: {
              id: string;
              tenant: { name: string };
              rentAmount: number;
              startDate: Date;
              endDate: Date;
              payments: any[];
            }) => (
              <div key={lease.id} className="border p-4 rounded-md">
                <h3 className="font-medium">Tenant: {lease.tenant.name}</h3>
                <p>Rent: ${lease.rentAmount}</p>
                <p>Start: {lease.startDate instanceof Date ? lease.startDate.toLocaleDateString() : new Date(lease.startDate).toLocaleDateString()}</p>
                <p>End: {lease.endDate instanceof Date ? lease.endDate.toLocaleDateString() : new Date(lease.endDate).toLocaleDateString()}</p>
                <p>Payments: {lease.payments.length}</p>
                <Link href={`/leases/${lease.id}`} className="text-blue-500 hover:underline">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No leases added yet.</p>
        )}
      </div>
    </div>
  );
}
