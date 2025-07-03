'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewLeasePage({ params }: { params: { id: string } }) {
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => setTenants(data))
      .catch(err => console.error('Error fetching tenants:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/leases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        unitId: params.id, 
        tenantId, 
        startDate, 
        endDate, 
        rentAmount 
      }),
    });

    if (res.ok) {
      router.push(`/units/${params.id}`);
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Lease</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="tenantId" className="block mb-1">Tenant</label>
          <select
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a tenant</option>
            {tenants.map((tenant: any) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block mb-1">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block mb-1">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="rentAmount" className="block mb-1">Rent Amount</label>
          <input
            type="number"
            id="rentAmount"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            required
            step="0.01"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Add Lease
        </button>
      </form>
    </div>
  );
}
