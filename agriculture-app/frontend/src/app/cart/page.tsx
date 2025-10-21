'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/hooks/useCart';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';
import styles from './cart.module.css';

export default function CartPage() {
  const { user, isAuthenticated } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const {
    cart,
    itemCount,
    totalAmount,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart(user?._id as string | null);

  useEffect(() => {
    // If user is not authenticated, show auth modal
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

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

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className={styles.authRequired}>
          <div className={styles.authCard}>
            <h2>Login Required</h2>
            <p>Please login or register to view your cart and place orders.</p>
            <button onClick={() => setShowAuthModal(true)} className={styles.loginButton}>
              Login / Register
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode="login"
        />
      </>
    );
  }

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
        <button onClick={handleClearCart} className={styles.clearButton}>
          Clear Cart
        </button>
      </div>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cart.map((item) => (
            <div key={item.productId} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.productName}</h3>
                <p className={styles.itemPrice}>₹{item.price.toLocaleString()}</p>
                <p className={styles.itemAdded}>
                  Added: {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>

              <div className={styles.itemActions}>
                <div className={styles.quantityControl}>
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    className={styles.quantityButton}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalAmount}>
                    ₹{(item.price * item.quantity).toLocaleString()}
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
  );
}
