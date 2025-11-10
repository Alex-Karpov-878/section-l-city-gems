'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/endpoints';
import { useKioskStore } from '@/store/kiosk-store';
import { Building } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
}

export default function ConfigModal({ isOpen }: ConfigModalProps) {
  const router = useRouter();
  const { setProperty } = useKioskStore();

  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['allProperties'],
    queryFn: api.getProperties,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold">Select a Property</h2>
        <p className="mb-6 text-gray-600">
          Choose the property for this kiosk.
        </p>

        {isLoading && <p>Loading properties...</p>}
        {error && <p className="text-red-500">Failed to load properties.</p>}

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {properties?.map((prop) => (
            <button
              key={prop.id}
              onClick={() => {
                setProperty(prop);
                router.push(`/${prop.slug}`);
              }}
              className="flex w-full items-center gap-4 rounded-lg p-4 text-left transition-colors hover:bg-gray-100"
            >
              <Building className="text-gray-500" />
              <div>
                <p className="font-semibold">{prop.name}</p>
                <p className="text-sm text-gray-500">{prop.acronym}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
