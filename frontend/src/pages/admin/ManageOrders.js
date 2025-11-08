import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/ManageOrders.css';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        orderStatus: newStatus
      });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update order status');
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
    <div className="manage-orders">
      <div className="container">
        <h1>Manage Orders</h1>
        <div className="orders-content">
          <div className="orders-list">
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              orders.map(order => (
                <div
                  key={order._id}
                  className={`order-card ${selectedOrder?._id === order._id ? 'active' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <h3>Order #{order.orderId}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="order-card-info">
                    <p><strong>Customer:</strong> {order.userId?.name || 'N/A'}</p>
                    <p><strong>Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedOrder && (
            <div className="order-details">
              <h2>Order Details</h2>
              <div className="order-info-section">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                <p><strong>Status:</strong>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
                <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              <div className="order-info-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.userId?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</p>
              </div>

              <div className="order-info-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.name}</p>
                <p>{selectedOrder.shippingAddress.phone}</p>
                <p>{selectedOrder.shippingAddress.address}</p>
                <p>
                  {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>

              <div className="order-info-section">
                <h3>Products</h3>
                <div className="order-products">
                  {selectedOrder.products.map((item, index) => (
                    <div key={index} className="order-product-item">
                      {item.productId?.images && item.productId.images.length > 0 && (
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                        />
                      )}
                      <div className="order-product-info">
                        <h4>{item.productId?.name || 'Product'}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ${item.price.toFixed(2)}</p>
                        <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;

