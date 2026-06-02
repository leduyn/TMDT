'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SalesPolicyForm from '@/components/SalesPolicyForm';
import { useAuth } from '@/context/AuthContext';

function NewSalesPolicyContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));
  const defaultType = (searchParams.get('type') === 'PROMOTION' ? 'PROMOTION' : searchParams.get('type') === 'RETAIL_POLICY' ? 'RETAIL_POLICY' : 'SALES_POLICY') as 'SALES_POLICY' | 'PROMOTION' | 'RETAIL_POLICY';

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
        <SalesPolicyForm initialId={null} defaultPolicyType={defaultType} />
      </main>
    </>
  );
}

export default function NewSalesPolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grid flex items-center justify-center text-[var(--text-secondary)]">Đang tải...</div>}>
      <NewSalesPolicyContent />
    </Suspense>
  );
}
