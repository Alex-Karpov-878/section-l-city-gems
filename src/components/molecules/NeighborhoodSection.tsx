'use client';

interface NeighborhoodSectionProps {
  neighborhoods: string[];
  activeNeighborhood: string | null;
  onNeighborhoodClick: (neighborhood: string) => void;
}

export default function NeighborhoodSection({
  neighborhoods,
  activeNeighborhood,
  onNeighborhoodClick,
}: NeighborhoodSectionProps) {
  return (
    <div className="sticky top-0 z-10 border-r border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Neighborhoods
      </h3>
      <nav className="space-y-1">
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood}
            onClick={() => onNeighborhoodClick(neighborhood)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
              activeNeighborhood === neighborhood
                ? 'border-l-4 border-blue-500 bg-blue-50 font-medium text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            } `}
          >
            {neighborhood}
          </button>
        ))}
      </nav>
    </div>
  );
}
