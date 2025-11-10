import React from 'react';

interface MainAppLayoutProps {
  header: React.ReactNode;
  neighborhoodsNav: React.ReactNode;
  mainContent: React.ReactNode;
  favoritesList: React.ReactNode;
}

export function MainAppLayout({
  header,
  neighborhoodsNav,
  mainContent,
  favoritesList,
}: MainAppLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {header}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_360px] lg:gap-6 lg:p-6">
        <aside className="hidden overflow-y-auto rounded-lg bg-white p-4 shadow-sm md:block">
          {neighborhoodsNav}
        </aside>
        <main className="overflow-y-auto">{mainContent}</main>
        <aside className="hidden overflow-y-auto lg:block">
          {favoritesList}
        </aside>
      </div>
    </div>
  );
}
