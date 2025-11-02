'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import { toast } from 'react-toastify';
import styles from './cart.module.css';

export default function CartPage() {
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

  useEffect(() => {
    // Redirect to dashboard if user is not authenticated
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

  const handleEditClick = (productId: string, currentWeight: number) => {
    setEditingItemId(productId);
    setEditingItemWeight(currentWeight);
    setEditWeight(currentWeight.toString());
  };

  const handleWeightUpdate = async (productId: string) => {
    const newWeight = parseFloat(editWeight);
    if (isNaN(newWeight) || newWeight <= 0 || newWeight > 50) {
      toast.error('Please enter a valid weight between 1 and 50 kg');
      return;
    }
    
    // Call API to update weight
    const success = await updateCartWeight(productId, editingItemWeight, newWeight);
    
    if (success) {
      toast.success('Weight updated successfully!');
      setEditingItemId(null);
      setEditWeight('');
      setEditingItemWeight(0);
    } else {
      toast.error('Failed to update weight. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditWeight('');
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

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show empty cart message
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
    <>
      <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shopping Cart ({itemCount} items)</h1>
        <button onClick={handleClearCart} className={styles.clearButton}>
          Clear Cart
        </button>
      </div>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cart.map((item) => (
            <div key={`${item.productId}-${item.weight || 0}`} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.productName}</h3>
                <p className={styles.itemPrice}>
                  ₹{item.price.toLocaleString()}/kg
                </p>
                {item.weight && (
                  <div className={styles.weightSection}>
                    {editingItemId === item.productId ? (
                      <div className={styles.editWeightContainer}>
                        <input
                          type="number"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className={styles.weightInput}
                          placeholder="Weight (kg)"
                          min="1"
                          max="50"
                        />
                        <button
                          onClick={() => handleWeightUpdate(item.productId)}
                          className={styles.saveButton}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className={styles.cancelButton}
                        >
                          ✕
                        </button>
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

                <button
                  onClick={() => handleRemove(item.productId)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
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
          
          <button className={styles.checkoutButton}>
            Proceed to Checkout
          </button>
          
          <Link href="/km-agri-dashboard" className={styles.continueShoppingLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
