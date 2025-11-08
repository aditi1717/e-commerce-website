import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import '../styles/MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = user._id || user.id;
      const response = await axios.get(`/api/orders/user/${userId}`);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#28a745';
      case 'Shipped':
        return '#17a2b8';
      case 'Processing':
        return '#ffc107';
      default:
        return '#dc3545';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="my-orders">
      <div className="container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You have no orders yet.</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.orderId}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.products && order.products.length > 0 && (
                      <div className="order-products-preview">
                        <strong>Products: </strong>
                        {order.products.map((item, idx) => {
                          // Handle both populated object and string ID
                          let productName = `Product ${idx + 1}`;
                          if (item.productId) {
                            if (typeof item.productId === 'object' && item.productId !== null && item.productId.name) {
                              productName = item.productId.name;
                            }
                          }
                          return (
                            <span key={idx}>
                              {productName}
                              {idx < order.products.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="order-status">
                    <span
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                {order.products && order.products.length > 0 ? (
                  <div className="order-items">
                    <h4 className="order-items-title">
                      Products for Order #{order.orderId}
                    </h4>
                    {order.products.map((item, index) => {
                      // Extract product data - handle both populated object and string ID
                      const product = typeof item.productId === 'object' && item.productId !== null 
                        ? item.productId 
                        : null;
                      const productId = product?._id || (typeof item.productId === 'string' ? item.productId : null);
                      const productName = product?.name || `Product ${index + 1}`;
                      const productImages = product?.images || [];
                      
                      return (
                        <div key={index} className="order-item">
                          <div className="order-item-image">
                            {productImages.length > 0 ? (
                              <img
                                src={productImages[0]}
                                alt={productName}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.parentElement.querySelector('.order-item-placeholder');
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="order-item-placeholder"
                              style={{ display: productImages.length > 0 ? 'none' : 'flex' }}
                            >
                              <span>📦</span>
                            </div>
                          </div>
                          <div className="order-item-info">
                            <div className="order-item-header">
                              <h4>
                                {productId ? (
                                  <Link to={`/product/${productId}`}>
                                    {productName}
                                  </Link>
                                ) : (
                                  <span>{productName}</span>
                                )}
                              </h4>
                              <span className="order-id-badge">Order #{order.orderId}</span>
                            </div>
                            <div className="order-item-details">
                              <p>
                                <strong>Quantity:</strong> 
                                <span>{item.quantity} {item.quantity === 1 ? 'item' : 'items'}</span>
                              </p>
                              <p>
                                <strong>Unit Price:</strong> 
                                <span>${item.price.toFixed(2)}</span>
                              </p>
                              <p>
                                <strong>Total:</strong> 
                                <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="order-item-total">
                            <span className="order-item-total-label">Subtotal:</span>
                            <span className="order-item-total-amount">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="order-items">
                    <p className="no-products">No products found in this order.</p>
                  </div>
                )}
                <div className="order-footer">
                  <div className="order-address">
                    <strong>Shipping Address:</strong>
                    <p>
                      {order.shippingAddress.name}, {order.shippingAddress.phone}
                    </p>
                    <p>
                      {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                    </p>
                   {order.paymentMethod && (
  <p className="payment-method-info">
    <strong>Payment:</strong> {order.paymentMethod} 
    <span
      className={`payment-status ${
        order.paymentMethod === 'Cash on Delivery' && order.orderStatus === 'Pending'
          ? 'pending'
          : order.paymentStatus?.toLowerCase()
      }`}
    >
      (
      {order.paymentMethod === 'Cash on Delivery' && order.orderStatus === 'Pending'
        ? 'Pending'
        : order.paymentStatus || 'Pending'}
      )
    </span>
  </p>
)}

                  </div>
                  <div className="order-total">
                    <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

