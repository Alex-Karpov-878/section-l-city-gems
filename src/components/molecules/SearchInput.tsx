import { Search } from 'lucide-react';
export function SearchInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder="Search for sushi, cafes, museums..."
        className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-gray-800 placeholder-gray-500 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        {...props}
      />
    </div>
  );
}
