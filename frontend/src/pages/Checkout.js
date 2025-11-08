import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validate form
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        products: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: formData,
        paymentMethod
      };

      const response = await axios.post('/api/orders', orderData);
      toast.success(`Order placed successfully! ${paymentMethod === 'Cash on Delivery' ? 'Payment will be collected on delivery.' : 'Payment completed.'}`);
      clearCart();
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-content">
          <div className="checkout-form">
            <h2>Shipping Address</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <div className="payment-methods">
                  <label className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    />
                    <div className="payment-method-card">
                      <span className="payment-icon">💵</span>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>
                  <label className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online Pay"
                      checked={paymentMethod === 'Online Pay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    />
                    <div className="payment-method-card">
                      <span className="payment-icon">💳</span>
                      <div>
                        <strong>Online Pay</strong>
                        <p>Pay securely online</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Placing Order...' : paymentMethod === 'Cash on Delivery' ? 'Place Order' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cart.map(item => (
                <div key={item._id} className="order-item">
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="order-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row final">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

