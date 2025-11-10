'use client';

import CategoryButton from '../atoms/CategoryButton';
import { Category } from '@/types/api';

interface CategoryFilterProps {
  activeCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

const categories: Category[] = ['Food & Drink', 'Shopping', 'Culture'];

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryButton
          key={category}
          category={category}
          isActive={activeCategory === category}
          onClick={onCategoryChange}
        />
      ))}
    </div>
  );
}
