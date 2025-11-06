'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Button, Input } from '@/components/common';
import styles from './CartClient.module.css';

export default function CartClient() {
  const router = useRouter();
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const {
    cart,
    itemCount,
    totalAmount,
    loading,
    error,
    updateCartItem,
    updateCartWeight,
    removeFromCart,
    clearCart,
  } = useCart(user?._id?.toString() ?? null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemWeight, setEditingItemWeight] = useState<number>(0);
  const [editWeight, setEditWeight] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated && !userLoading) {
      router.push('/km-agri-dashboard');
    }
  }, [isAuthenticated, userLoading, router]);

  const handleRemove = async (productId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  const handleEditClick = (productId: string, currentWeight: number, currentQuantity?: number) => {
    setEditingItemId(productId);
    setEditingItemWeight(currentWeight);
    setEditWeight(currentWeight.toString());
    if (currentQuantity) {
      setEditQuantity(currentQuantity.toString());
    }
  };

  const handleWeightUpdate = async (productId: string, hasWeight: boolean) => {
    if (hasWeight) {
      const newWeight = parseFloat(editWeight);
      if (isNaN(newWeight) || newWeight <= 0 || newWeight > 50) {
        toast.error('Please enter a valid weight between 1 and 50 kg');
        return;
      }
      
      const success = await updateCartWeight(productId, editingItemWeight, newWeight);
      
      if (success) {
        toast.success('Weight updated successfully!');
        setEditingItemId(null);
        setEditWeight('');
        setEditingItemWeight(0);
      } else {
        toast.error('Failed to update weight. Please try again.');
      }
    } else {
      const newQuantity = parseInt(editQuantity);
      if (isNaN(newQuantity) || newQuantity <= 0 || newQuantity > 100) {
        toast.error('Please enter a valid quantity between 1 and 100');
        return;
      }
      
      const success = await updateCartItem(productId, newQuantity);
      
      if (success) {
        toast.success('Quantity updated successfully!');
        setEditingItemId(null);
        setEditQuantity('');
      } else {
        toast.error('Failed to update quantity. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditWeight('');
    setEditQuantity('');
  };

  const calculateItemTotal = (item: any) => {
    if (item.weight) {
      return item.price * item.weight;
    }
    return item.price * item.quantity;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link href="/km-agri-dashboard" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shopping Cart ({itemCount} items)</h1>
        <Button onClick={handleClearCart} variant="danger" size="medium">
          Clear Cart
        </Button>
      </div>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cart.map((item) => (
            <div key={`${item.productId}-${item.weight || 0}`} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.productName}</h3>
                <p className={styles.itemPrice}>
                  ₹{item.price.toLocaleString()}/{item.weight ? 'kg' : 'bag'}
                </p>
                {item.weight ? (
                  <div className={styles.weightSection}>
                    {editingItemId === item.productId ? (
                      <div className={styles.editWeightContainer}>
                        <Input
                          type="number"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          placeholder="Weight (kg)"
                          min="1"
                          max="50"
                          size="small"
                        />
                        <Button
                          onClick={() => handleWeightUpdate(item.productId, true)}
                          variant="success"
                          size="small"
                        >
                          ✓
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="danger"
                          size="small"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.weightDisplay}>
                        <span className={styles.itemWeight}>
                          Weight: {item.weight} kg
                        </span>
                        <button
                          onClick={() => handleEditClick(item.productId, item.weight || 0)}
                          className={styles.editButton}
                          title="Edit weight"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.weightSection}>
                    {editingItemId === item.productId ? (
                      <div className={styles.editWeightContainer}>
                        <Input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          placeholder="Number of bags"
                          min="1"
                          max="100"
                          size="small"
                        />
                        <Button
                          onClick={() => handleWeightUpdate(item.productId, false)}
                          variant="success"
                          size="small"
                        >
                          ✓
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="danger"
                          size="small"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.weightDisplay}>
                        <span className={styles.itemWeight}>
                          Quantity: {item.quantity} {item.quantity === 1 ? 'bag' : 'bags'}
                        </span>
                        <button
                          onClick={() => handleEditClick(item.productId, 0, item.quantity)}
                          className={styles.editButton}
                          title="Edit quantity"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <p className={styles.itemAdded}>
                  Added: {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>

              <div className={styles.itemActions}>
                <div className={styles.itemTotal}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalAmount}>
                    ₹{calculateItemTotal(item).toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={() => handleRemove(item.productId)}
                  variant="danger"
                  size="small"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal ({itemCount} items):</span>
            <span className={styles.summaryValue}>₹{totalAmount.toLocaleString()}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Shipping:</span>
            <span className={styles.summaryValue}>Free</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Tax:</span>
            <span className={styles.summaryValue}>Calculated at checkout</span>
          </div>
          
          <div className={styles.summaryTotal}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>₹{totalAmount.toLocaleString()}</span>
          </div>
          
          <Button variant="primary" size="large" fullWidth>
            Proceed to Checkout
          </Button>
          
          <Link href="/km-agri-dashboard" className={styles.continueShoppingLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
