import { cn } from '@/lib/utils';
import { Landmark } from 'lucide-react';
import React from 'react';

export const Logo = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center gap-2 text-xl font-bold tracking-tight',
      className,
    )}
    {...props}
  >
    <Landmark className="h-6 w-6" />
    <span>SECTION L</span>
  </div>
);
