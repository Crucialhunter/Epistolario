import type { ReactNode } from 'react';
import TopNav from '@/components/navigation/TopNav';
import ArchiveFooter from '@/components/navigation/ArchiveFooter';

interface ArchiveShellProps {
  children: ReactNode;
}

export default function ArchiveShell({ children }: ArchiveShellProps) {
  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#1b180d]">
      <TopNav />
      <main>{children}</main>
      <ArchiveFooter />
    </div>
  );
}
