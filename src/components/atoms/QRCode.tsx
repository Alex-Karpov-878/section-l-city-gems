'use client';

import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';
import { Smartphone } from 'lucide-react';

interface QRCodeProps {
  gemIds: string[];
  propertyId?: string;
}

export default function QRCode({ gemIds, propertyId }: QRCodeProps) {
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    if (!gemIds || gemIds.length === 0) {
      // clear state asynchronously to avoid sync setState in effect body
      if (typeof window !== 'undefined') {
        const t = window.setTimeout(() => setQrCodeSvg(''), 0);
        return () => window.clearTimeout(t);
      }
      return;
    }

    const generate = async () => {
      try {
        const baseUrl =
          typeof window !== 'undefined' ? window.location.origin : '';
        const params = new URLSearchParams({
          gems: gemIds.join(','),
          ...(propertyId ? { property: propertyId } : {}),
        });
        const url = `${baseUrl}?${params.toString()}`;

        const svg = await QRCodeLib.toString(url, {
          type: 'svg',
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });

        if (mounted) setQrCodeSvg(svg);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generate();

    return () => {
      mounted = false;
    };
  }, [gemIds, propertyId]);

  if (!qrCodeSvg) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({ gems: gemIds.join(',') });
  if (propertyId) params.set('property', propertyId);
  const url = `${baseUrl}?${params.toString()}`;

  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer transition-opacity hover:opacity-80"
        title="Click to open link"
      >
        <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
      </a>
      <div className="mt-3 text-center">
        <Smartphone className="mx-auto mb-1 h-5 w-5 text-gray-600" />
        <p className="text-sm font-medium text-gray-700">Scan to save list</p>
        <p className="mt-1 text-xs text-gray-500">View on your phone</p>
      </div>
    </div>
  );
}
