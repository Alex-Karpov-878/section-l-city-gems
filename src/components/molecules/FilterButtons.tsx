import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface FilterItem {
  id: string | number;
  name: string;
}

interface FilterButtonsProps {
  label: string;
  items: FilterItem[];
  activeItem: string | null;
  onSelect: (itemName: string | null) => void;
}

export function FilterButtons({
  label,
  items,
  activeItem,
  onSelect,
}: FilterButtonsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              onSelect(activeItem === item.name ? null : item.name)
            }
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              activeItem === item.name
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
            )}
          >
            {item.name}
            {activeItem === item.name && <X className="ml-1 inline h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}
