'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UtilityProvider {
  id: string;
  name: string;
}

export default function NewUtilityReadingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<UtilityProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    providerId: '',
    reading: '',
    readingDate: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProviders();
    }
  }, [status, router]);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/utilities');
      if (!res.ok) {
        throw new Error('Failed to fetch utility providers');
      }
      const data = await res.json();
      setProviders(data);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    data.append('providerId', formData.providerId);
    data.append('reading', formData.reading);
    data.append('readingDate', formData.readingDate);
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const res = await fetch('/api/utility-readings', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create utility reading');
      }

      router.push('/utilities');
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Utility Reading</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 border rounded-lg bg-white shadow-sm">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}
        <div>
          <label htmlFor="providerId" className="block text-sm font-medium text-gray-700">Utility Provider</label>
          <select
            id="providerId"
            name="providerId"
            value={formData.providerId}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reading" className="block text-sm font-medium text-gray-700">Reading</label>
          <input
            type="number"
            id="reading"
            name="reading"
            value={formData.reading}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="readingDate" className="block text-sm font-medium text-gray-700">Reading Date</label>
          <input
            type="date"
            id="readingDate"
            name="readingDate"
            value={formData.readingDate}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo of Meter</label>
          <input
            type="file"
            id="photo"
            name="photo"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Reading
        </button>
      </form>
    </div>
  );
}
