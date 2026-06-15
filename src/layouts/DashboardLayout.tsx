import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function DashboardLayout() {

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex overflow-hidden">
      <Sidebar />

      <motion.div
        className={cn(
          'flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300',
          'lg:ml-[240px]'
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-5 overflow-hidden min-w">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full min-w-0"
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}