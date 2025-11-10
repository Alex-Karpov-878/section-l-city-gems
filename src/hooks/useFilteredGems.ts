import { useMemo } from 'react';
import { useKioskStore } from '@/store/kiosk-store';
import { CityGem, Property } from '@/types/api';

interface GroupedGems {
  [neighborhoodName: string]: CityGem[];
}

export function useFilteredGems(
  property: Property | null,
  allGems: CityGem[] | undefined,
  debouncedSearchQuery: string,
) {
  const { activeCategory } = useKioskStore();

  const relevantGems = useMemo<CityGem[]>(() => {
    if (!property?.neighborhoods || !allGems) {
      return [];
    }
    const propertyNeighborhoodIds = new Set(
      property.neighborhoods.map((n) => n.id),
    );
    return allGems.filter((gem) =>
      gem.neighborhoods.some(
        (n) =>
          typeof n.id === 'number' &&
          propertyNeighborhoodIds.has(n.id as number),
      ),
    );
  }, [allGems, property]);

  const filteredGems = useMemo<CityGem[]>(() => {
    if (!property) return [];

    const query =
      typeof debouncedSearchQuery === 'string' ? debouncedSearchQuery : '';

    return relevantGems.filter((gem) => {
      const searchMatch =
        !query ||
        gem.name.toLowerCase().includes(query.toLowerCase()) ||
        (gem.shortDescription &&
          gem.shortDescription.toLowerCase().includes(query.toLowerCase())) ||
        gem.tags?.some((tag) =>
          tag.name.toLowerCase().includes(query.toLowerCase()),
        );

      const categoryMatch = !activeCategory || gem.category === activeCategory;

      return searchMatch && categoryMatch;
    });
  }, [relevantGems, debouncedSearchQuery, activeCategory, property]);

  const groupedGems = useMemo<GroupedGems>(() => {
    if (!property?.neighborhoods || filteredGems.length === 0) {
      return {};
    }

    const groups: GroupedGems = {};
    for (const neighborhood of property.neighborhoods) {
      const gemsInNeighborhood = filteredGems.filter((gem) =>
        gem.neighborhoods.some((n) => n.id === neighborhood.id),
      );

      if (gemsInNeighborhood.length > 0) {
        groups[neighborhood.name] = gemsInNeighborhood;
      }
    }
    return groups;
  }, [filteredGems, property]);

  return { allGems: relevantGems, filteredGems, groupedGems };
}
