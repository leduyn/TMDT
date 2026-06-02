'use client';

import { use } from 'react';
import Navbar from '@/components/Navbar';
import SalesPolicyForm from '@/components/SalesPolicyForm';
import { useAuth } from '@/context/AuthContext';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditSalesPolicyPage({ params }: PageProps) {
  const resolvedParams = 'then' in params ? use(params as Promise<{ id: string }>) : params as { id: string };
  const policyId = Number(resolvedParams.id);
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
        <SalesPolicyForm initialId={policyId} />
      </main>
    </>
  );
}
