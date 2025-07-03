'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Rental Property Management
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Streamline your property management with our comprehensive dashboard
          </p>
        </div>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/properties" className="group transform transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-blue-100 text-sm">Active</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Properties</h2>
              <p className="text-blue-100">Manage your rental properties and track performance</p>
            </div>
          </Link>
          
          <Link href="/tenants" className="group transform transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-green-100 text-sm">Total</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Tenants</h2>
              <p className="text-green-100">Manage tenant information and communication</p>
            </div>
          </Link>
          
          <Link href="/payments" className="group transform transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$45K</div>
                  <div className="text-purple-100 text-sm">This Month</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Payments</h2>
              <p className="text-purple-100">Track rent payments and financial records</p>
            </div>
          </Link>
          
          <Link href="/utilities" className="group transform transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-orange-100 text-sm">Efficiency</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Utilities</h2>
              <p className="text-orange-100">Monitor utility readings and consumption</p>
            </div>
          </Link>
          
          <Link href="/inspections/checklists" className="group transform transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-red-100 text-sm">Scheduled</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Inspections</h2>
              <p className="text-red-100">Schedule and track property inspections</p>
            </div>
          </Link>
          
          <Link href="/reports" className="group transform transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-indigo-100 text-sm">Reports</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Reports</h2>
              <p className="text-indigo-100">View comprehensive analytics and insights</p>
            </div>
          </Link>
        </div>
        
        {/* Quick Stats Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-gray-600">Occupancy Rate</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-green-600">$2.4M</div>
              <div className="text-gray-600">Annual Revenue</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-purple-600">4.8</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-orange-600">24h</div>
              <div className="text-gray-600">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
