'use client';

import Navbar from '@/components/Navbar';
import SalesPolicyForm from '@/components/SalesPolicyForm';
import { useAuth } from '@/context/AuthContext';

export default function NewSalesPolicyPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">
          Bạn không có quyền truy cập module này.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-grid min-h-screen pt-4 pb-12">
        <SalesPolicyForm initialId={null} />
      </main>
    </>
  );
}
