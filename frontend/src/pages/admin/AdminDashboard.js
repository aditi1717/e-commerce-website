import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
      setRecentOrders(response.data.recentOrders);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-value">{stats?.totalProducts || 0}</p>
            <Link to="/admin/products" className="stat-link">Manage Products</Link>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
            <Link to="/admin/orders" className="stat-link">View Orders</Link>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats?.pendingOrders || 0}</p>
            <Link to="/admin/orders" className="stat-link">View Orders</Link>
          </div>
        </div>

        <div className="recent-orders">
          <h2>Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p>No recent orders</p>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>{order.userId?.name || 'N/A'}</td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

