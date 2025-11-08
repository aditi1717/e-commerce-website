import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import '../styles/Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'newest',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Refresh products periodically for real-time stock updates
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 12);

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products');
      const allProducts = response.data.products;
      const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success('Product added to cart');
    } else {
      toast.error('Product out of stock');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="home">
      <div className="container">
        <div className="filters">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort:</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <Link to={`/product/${product._id}`}>
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                      {product.rating > 0 && (
                        <p className="product-rating-small">
                          {'⭐'.repeat(Math.round(product.rating))}
                          {'☆'.repeat(5 - Math.round(product.rating))}
                          {' '}({product.rating.toFixed(1)}) - {product.numReviews || 0} reviews
                        </p>
                      )}
                      <p className="product-stock">
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </p>
                    </div>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button
                      className="btn btn-primary add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Add to Cart
                    </button>
                    <button
                      className={`btn btn-sm ${isInWishlist(product._id) ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => {
                        if (isInWishlist(product._id)) {
                          removeFromWishlist(product._id);
                          toast.success('Removed from wishlist');
                        } else {
                          addToWishlist(product);
                          toast.success('Added to wishlist');
                        }
                      }}
                      style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                      {isInWishlist(product._id) ? '❤️ Wishlisted' : '🤍 Wishlist'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {filters.page} of {pagination.pages}</span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

