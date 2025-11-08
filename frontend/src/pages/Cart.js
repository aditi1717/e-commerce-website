import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [productStocks, setProductStocks] = React.useState({});

  // Fetch latest stock for cart items
  React.useEffect(() => {
    const fetchStocks = async () => {
      if (cart.length === 0) return;
      try {
        const stockPromises = cart.map(item => 
          axios.get(`/api/products/${item._id}`).then(res => ({ id: item._id, stock: res.data.stock }))
        );
        const stocks = await Promise.all(stockPromises);
        const stockMap = {};
        stocks.forEach(({ id, stock }) => {
          stockMap[id] = stock;
        });
        setProductStocks(stockMap);
      } catch (error) {
        console.error('Failed to fetch stock:', error);
      }
    };
    fetchStocks();
    const interval = setInterval(fetchStocks, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [cart]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.info('Please login to view your cart');
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading or nothing while checking auth
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1>Shopping Cart</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="cart-item-info">
                  <Link to={`/product/${item._id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= (productStocks[item._id] ?? item.stock ?? 0)}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  className="btn-remove"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className="btn btn-secondary" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

