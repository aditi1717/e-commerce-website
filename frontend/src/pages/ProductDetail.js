import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ReviewSection from '../components/ReviewSection';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const fetchingRef = useRef(false);
  const navigateRef = useRef(navigate);
  const isInitialLoadRef = useRef(true);

  // Keep navigate ref updated
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const fetchProduct = useCallback(async (showLoading = false) => {
    if (!id || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      // Only show loading on initial load or if explicitly requested
      if (showLoading || isInitialLoadRef.current) {
        setLoading(true);
      }
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      isInitialLoadRef.current = false; // Mark initial load as complete
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to fetch product');
      // Use setTimeout to avoid navigation during render
      setTimeout(() => navigateRef.current('/'), 0);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    
    // Reset flags when id changes
    fetchingRef.current = false;
    isInitialLoadRef.current = true;
    
    // Initial fetch with loading indicator
    fetchProduct(true);
    
    // Refresh product periodically for real-time stock updates (every 10 seconds)
    // Don't show loading indicator for periodic refreshes
    const interval = setInterval(() => {
      if (id && !fetchingRef.current) {
        fetchProduct(false); // Don't show loading
      }
    }, 10000); // Refresh every 10 seconds
    
    // Refresh product when window gains focus (for real-time stock updates)
    // Don't show loading indicator for focus refreshes
    const handleFocus = () => {
      if (id && !fetchingRef.current) {
        fetchProduct(false); // Don't show loading
      }
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      fetchingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, fetchProduct is stable
  
  // Update quantity when product stock changes (if current quantity exceeds new stock)
  useEffect(() => {
    if (product && quantity > product.stock) {
      setQuantity(product.stock);
      if (product.stock > 0) {
        toast.info(`Stock updated. Available: ${product.stock}`);
      }
    }
  }, [product?.stock, quantity]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product.stock < quantity) {
      toast.error('Insufficient stock');
      return;
    }
    addToCart(product, quantity);
    toast.success('Product added to cart');
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          <div className="product-images">
            <div className="main-image">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[selectedImage]} alt={product.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            <div className="product-meta">
              <p><strong>Category:</strong> {product.category}</p>
              <p>
                <strong>Stock:</strong>{' '}
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </p>
              {product.rating > 0 && (
                <p>
                  <strong>Rating:</strong>{' '}
                  <span className="product-rating">
                    {'⭐'.repeat(Math.round(product.rating))}
                    {'☆'.repeat(5 - Math.round(product.rating))}
                  </span>
                  {' '}({product.rating.toFixed(1)}) - {product.numReviews || 0} reviews
                </p>
              )}
            </div>
            {product.stock > 0 && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      // Enforce max quantity based on current stock
                      const maxQty = product.stock || 0;
                      const newQty = Math.min(Math.max(1, val), maxQty);
                      setQuantity(newQty);
                      if (val > maxQty) {
                        toast.warning(`Maximum available stock is ${maxQty}`);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure quantity doesn't exceed stock when input loses focus
                      const val = parseInt(e.target.value) || 1;
                      const maxQty = product.stock || 0;
                      if (val > maxQty) {
                        setQuantity(maxQty);
                        toast.warning(`Quantity adjusted to available stock: ${maxQty}`);
                      } else if (val < 1) {
                        setQuantity(1);
                      }
                    }}
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => {
                      const maxQty = product.stock || 0;
                      if (quantity < maxQty) {
                        setQuantity(quantity + 1);
                      } else {
                        toast.warning(`Maximum available stock is ${maxQty}`);
                      }
                    }}
                    disabled={quantity >= (product.stock || 0)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                className="btn btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                className={`btn ${isInWishlist(product._id) ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => {
                  if (isInWishlist(product._id)) {
                    removeFromWishlist(product._id);
                    toast.success('Removed from wishlist');
                  } else {
                    addToWishlist(product);
                    toast.success('Added to wishlist');
                  }
                }}
                style={{ width: '100%' }}
              >
                {isInWishlist(product._id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
        {product && product._id && <ReviewSection productId={product._id} />}
      </div>
    </div>
  );
};

export default ProductDetail;

