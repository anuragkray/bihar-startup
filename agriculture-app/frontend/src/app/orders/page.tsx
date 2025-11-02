'use client';

import { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import OrderHistory from '@/components/orders/OrderHistory';

export default function OrdersPage() {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      <OrderHistory userId={user._id as string} />
    </div>
  );
}
