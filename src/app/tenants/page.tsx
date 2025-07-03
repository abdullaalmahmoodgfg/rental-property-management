import prisma from '@/lib/prisma';
import Link from 'next/link';

async function getTenants() {
  const tenants = await prisma.tenant.findMany({
    include: {
      leases: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });
  return tenants as { id: string; name: string; email: string; phone?: string; leases: any[] }[];
}

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenants</h1>
            <p className="text-gray-600">Manage your tenant relationships and communications</p>
          </div>
          <Link 
            href="/tenants/new" 
            className="mt-4 sm:mt-0 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
            </svg>
            <span>Add Tenant</span>
          </Link>
        </div>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant: { id: string; name: string; email: string; phone?: string; leases: any[] }) => (
            <Link key={tenant.id} href={`/tenants/${tenant.id}`}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
                {/* Tenant Header */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{tenant.name}</h2>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${tenant.leases.length > 0 ? 'bg-green-300' : 'bg-gray-300'}`}></div>
                        <span className="text-sm opacity-90">
                          {tenant.leases.length > 0 ? 'Active Tenant' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tenant Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      <span className="text-sm">{tenant.email}</span>
                    </div>
                    
                    {tenant.phone && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        <span className="text-sm">{tenant.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{tenant.leases.length}</div>
                          <div className="text-xs text-gray-500">Lease{tenant.leases.length !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">100%</div>
                          <div className="text-xs text-gray-500">On Time</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                        View Profile →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {tenants.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tenants yet</h3>
            <p className="text-gray-600 mb-6">Start building your tenant database</p>
            <Link 
              href="/tenants/new" 
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
              <span>Add Your First Tenant</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
