'use client';

import { ShoppingBag, Coffee, Camera } from 'lucide-react';
import { Category } from '@/types/api';
import { cn } from '@/lib/utils';

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: (category: Category | null) => void;
}

const iconMap: Record<Category, React.ElementType> = {
  'Food & Drink': Coffee,
  Shopping: ShoppingBag,
  Culture: Camera,
};

export default function CategoryButton({
  category,
  isActive,
  onClick,
}: CategoryButtonProps) {
  const Icon = iconMap[category];

  return (
    <button
      onClick={() => onClick(isActive ? null : category)}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border p-4 shadow-sm transition-all duration-200 ease-in-out',
        isActive
          ? 'scale-105 border-brand-primary/50 bg-brand-primary/10 text-brand-primary shadow-md'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      <Icon className="mb-2 h-6 w-6" />
      <span className="text-sm font-medium">{category}</span>
    </button>
  );
}
