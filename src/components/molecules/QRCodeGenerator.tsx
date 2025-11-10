'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, EmptyState, Button } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { UI_LABELS, TEST_IDS } from '@/constants';

export interface QRCodeGeneratorProps {
  gemIds: number[];
  propertySlug?: string;
  size?: number;
  showDownload?: boolean;
  className?: string;
}

export const QRCodeGenerator = React.memo<QRCodeGeneratorProps>(
  ({ gemIds, size = 160, showDownload = false, className }) => {
    const [shareUrl, setShareUrl] = React.useState<string>('');

    React.useEffect(() => {
      if (typeof window === 'undefined') return;

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const params = new URLSearchParams();

      if (gemIds.length > 0) {
        params.set('gems', gemIds.join(','));
      }

      const url = `${baseUrl}/share?${params.toString()}`;
      setShareUrl(url);
    }, [gemIds]);

    const handleDownload = React.useCallback(() => {
      const svg = document.getElementById('qr-code-svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.download = 'qr-code.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }, [size]);

    const hasGems = gemIds.length > 0;

    return (
      <Card
        variant="outlined"
        className={cn('text-center', className)}
        data-testid={TEST_IDS.QR_CODE_MODAL}
      >
        <AnimatePresence mode="wait">
          {hasGems && shareUrl ? (
            <motion.div
              key="qr-visible"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              {}
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer transition-opacity hover:opacity-80"
                title="Click to open link"
              >
                <div
                  className={cn(
                    'mx-auto mb-4 rounded-lg bg-white p-3',
                    'border-4 border-gray-100',
                    'shadow-sm',
                  )}
                  style={{ width: size + 24, height: size + 24 }}
                >
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={shareUrl}
                    size={size}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    includeMargin={false}
                    className="h-full w-full"
                    aria-label="QR code for sharing favorites"
                    data-testid={TEST_IDS.QR_CODE_IMAGE}
                  />
                </div>
              </a>

              {}
              <div className="mb-2 flex items-center justify-center gap-2">
                <Smartphone
                  className="h-5 w-5 text-gray-600"
                  aria-hidden="true"
                />
                <p className="font-semibold text-gray-800">
                  Scan to Take With You
                </p>
              </div>
              <p className="max-w-xs text-xs text-gray-500">
                Open your phone&apos;s camera and point it at the screen to
                access your favorites on mobile.
              </p>

              {}
              {showDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="mt-4"
                  data-testid={TEST_IDS.QR_CODE_DOWNLOAD}
                >
                  {UI_LABELS.DOWNLOAD_QR}
                </Button>
              )}

              {}
              <div className="sr-only" role="status" aria-live="polite">
                QR code generated for {gemIds.length} favorite gem
                {gemIds.length !== 1 ? 's' : ''}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="qr-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={<Smartphone className="h-full w-full" />}
                title="Your QR code will appear here"
                description={UI_LABELS.FAVORITES_EMPTY_DESCRIPTION}
                size="sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  },
);

QRCodeGenerator.displayName = 'QRCodeGenerator';
