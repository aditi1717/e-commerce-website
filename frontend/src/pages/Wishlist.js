import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Wishlist.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      return;
    }
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success('Product added to cart');
    } else {
      toast.error('Product out of stock');
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist">
        <div className="container">
          <h1>My Wishlist</h1>
          <div className="empty-wishlist">
            <h2>Your wishlist is empty</h2>
            <p>Start adding products to your wishlist!</p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist">
      <div className="container">
        <h1>My Wishlist ({wishlist.length})</h1>
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <div key={product._id} className="wishlist-item">
              <Link to={`/product/${product._id}`}>
                <div className="wishlist-item-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="wishlist-item-info">
                  <h3>{product.name}</h3>
                  <p className="wishlist-item-price">${product.price.toFixed(2)}</p>
                  <p className="wishlist-item-stock">
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </p>
                </div>
              </Link>
              <div className="wishlist-item-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    removeFromWishlist(product._id);
                    toast.success('Removed from wishlist');
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

