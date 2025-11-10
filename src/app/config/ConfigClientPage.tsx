/**
 * ConfigClientPage Component
 *
 * Kiosk configuration page for property selection.
 * Uses centered layout with property selection grid.
 *
 * Features:
 * - Property selection grid
 * - Logo and branding
 * - Keyboard navigation
 * - PropertyCard molecules
 * - Full accessibility
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ConfigLayout } from '@/components/templates';
import { PropertyCard } from '@/components/molecules';
import { Logo } from '@/components/ui/Logo';
import { Property } from '@/types/api';
import { ROUTES, TEST_IDS, UI_LABELS } from '@/constants';

export interface ConfigClientPageProps {
  /**
   * Available properties for selection
   */
  properties: Property[];
}

/**
 * ConfigClientPage - Property selection interface
 */
export default function ConfigClientPage({
  properties,
}: ConfigClientPageProps) {
  const router = useRouter();

  // Handle property selection
  const handlePropertySelect = React.useCallback(
    async (property: Property) => {
      // Navigate to the property's kiosk page
      await router.push(ROUTES.PROPERTY(property.slug));
    },
    [router],
  );

  return (
    <ConfigLayout
      logo={<Logo className="h-12 w-auto text-brand-primary" />}
      title={UI_LABELS.CONFIG_TITLE}
      description={UI_LABELS.CONFIG_DESCRIPTION}
      maxWidth="4xl"
    >
      {/* Property Selection Grid */}
      <div
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Available properties"
        data-testid={TEST_IDS.CONFIG_PAGE}
      >
        {properties.map((property) => (
          <div key={property.id} role="listitem">
            <PropertyCard
              property={property}
              onSelect={handlePropertySelect}
              isSelected={false}
              showNeighborhoodsCount
            />
          </div>
        ))}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}{' '}
        available for selection
      </div>
    </ConfigLayout>
  );
}
