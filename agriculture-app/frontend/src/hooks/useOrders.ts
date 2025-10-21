import { useState, useEffect } from 'react';
import { IPurchaseHistory, ApiResponse } from '@/types/user';

export const useOrders = (userId: string | null, page: number = 1, limit: number = 10) => {
  const [orders, setOrders] = useState<IPurchaseHistory[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
  });

  const fetchOrders = async (status?: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) params.append('status', status);

      const response = await fetch(`/api/users/orders/${userId}?${params.toString()}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setOrders(data.data.orders);
        setTotalOrders(data.data.totalOrders);
        setTotalSpent(data.data.totalSpent);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: any): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/orders/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchOrders(); // Refresh orders
        return true;
      } else {
        setError(data.message || 'Failed to add order');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/orders/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status, trackingNumber }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchOrders(); // Refresh orders
        return true;
      } else {
        setError(data.message || 'Failed to update order');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId, page, limit]);

  return {
    orders,
    totalOrders,
    totalSpent,
    pagination,
    loading,
    error,
    addOrder,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};
