import { useState, useEffect } from 'react';
import { ICartItem, AddToCartRequest, UpdateCartItemRequest, ApiResponse } from '@/types/user';

export const useCart = (userId: string | null) => {
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/cart/${userId}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setCart(data.data.cart);
        setItemCount(data.data.itemCount);
        setTotalAmount(data.data.totalAmount);
      } else {
        setError(data.message || 'Failed to fetch cart');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: AddToCartRequest): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/cart/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchCart(); // Refresh cart
        return true;
      } else {
        setError(data.message || 'Failed to add item to cart');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/cart/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchCart(); // Refresh cart
        return true;
      } else {
        setError(data.message || 'Failed to update cart item');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartWeight = async (productId: string, oldWeight: number, newWeight: number): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/cart/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, oldWeight, weight: newWeight }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchCart(); // Refresh cart
        return true;
      } else {
        setError(data.message || 'Failed to update cart weight');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/cart/${userId}?productId=${productId}`, {
        method: 'DELETE',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchCart(); // Refresh cart
        return true;
      } else {
        setError(data.message || 'Failed to remove item from cart');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/cart/${userId}?clearAll=true`, {
        method: 'DELETE',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchCart(); // Refresh cart
        return true;
      } else {
        setError(data.message || 'Failed to clear cart');
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
    fetchCart();
  }, [userId]);

  return {
    cart,
    itemCount,
    totalAmount,
    loading,
    error,
    addToCart,
    updateCartItem,
    updateCartWeight,
    removeFromCart,
    clearCart,
    refetch: fetchCart,
  };
};
