import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import ModesMenu from './ModesMenu';

export default function Layout() {
  const [modesOpen, setModesOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <TopNav onOpenModes={() => setModesOpen(true)} />
      <ModesMenu open={modesOpen} onClose={() => setModesOpen(false)} />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
