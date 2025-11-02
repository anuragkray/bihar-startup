'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import styles from './OrderHistory.module.css';

interface OrderHistoryProps {
  userId: string;
}

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { orders, totalOrders, totalSpent, pagination, loading, error, refetch } = useOrders(
    userId,
    page,
    10
  );

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    refetch(status || undefined);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    return colors[status] || 'pending';
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Order History</h2>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Orders:</span>
            <span className={styles.statValue}>{totalOrders}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Spent:</span>
            <span className={styles.statValue}>₹{totalSpent.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className={styles.filters}>
        <button
          onClick={() => handleFilterChange('')}
          className={`${styles.filterButton} ${!statusFilter ? styles.active : ''}`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('pending')}
          className={`${styles.filterButton} ${statusFilter === 'pending' ? styles.active : ''}`}
        >
          Pending
        </button>
        <button
          onClick={() => handleFilterChange('processing')}
          className={`${styles.filterButton} ${statusFilter === 'processing' ? styles.active : ''}`}
        >
          Processing
        </button>
        <button
          onClick={() => handleFilterChange('shipped')}
          className={`${styles.filterButton} ${statusFilter === 'shipped' ? styles.active : ''}`}
        >
          Shipped
        </button>
        <button
          onClick={() => handleFilterChange('delivered')}
          className={`${styles.filterButton} ${statusFilter === 'delivered' ? styles.active : ''}`}
        >
          Delivered
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className={styles.emptyOrders}>
          <h3>No orders found</h3>
          <p>You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.orderId} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderId}>Order #{order.orderId}</h3>
                  <p className={styles.orderDate}>
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`${styles.statusBadge} ${styles[getStatusColor(order.status)]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className={styles.orderProducts}>
                {order.products.map((product, index) => (
                  <div key={index} className={styles.product}>
                    <span className={styles.productName}>{product.productName}</span>
                    <span className={styles.productQuantity}>Qty: {product.quantity}</span>
                    <span className={styles.productPrice}>₹{product.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.shippingAddress}>
                  <strong>Shipping Address:</strong>
                  <p>
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                  </p>
                  <p>
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
                <div className={styles.orderTotal}>
                  <span className={styles.totalLabel}>Total Amount:</span>
                  <span className={styles.totalAmount}>₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {order.trackingNumber && (
                <div className={styles.tracking}>
                  <strong>Tracking Number:</strong> {order.trackingNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
