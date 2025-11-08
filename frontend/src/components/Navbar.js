import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import '../styles/Navbar.css';
import { IoMenu } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLinkClick = () => {
    // Close the menu when a link is clicked (mobile UX improvement)
    if (window.innerWidth <= 600) {
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
            E-Commerce
          </Link>

          {/* Hamburger icon - visible only below 600px */}
          <div className="menu-icon" onClick={toggleMenu}>
            {menuOpen ? <RxCross2 size={26} /> : <IoMenu size={26} />}
          </div>

          {/* Navbar links */}
          <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={handleLinkClick}>Home</Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                    <Link to="/admin/products" onClick={handleLinkClick}>Products</Link>
                    <Link to="/admin/orders" onClick={handleLinkClick}>Orders</Link>
                  </>
                )}
                <Link to="/my-orders" onClick={handleLinkClick}>My Orders</Link>
                <Link to="/wishlist" className="cart-link" onClick={handleLinkClick}>
                  Wishlist <span className="cart-badge">{getWishlistCount()}</span>
                </Link>
                <Link to="/cart" className="cart-link" onClick={handleLinkClick}>
                  Cart <span className="cart-badge">{getCartCount()}</span>
                </Link>
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    toast.info('Please login to view your cart');
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                  className="cart-link-btn"
                >
                  Cart <span className="cart-badge">{getCartCount()}</span>
                </button>
                <Link to="/login" onClick={handleLinkClick}>Login</Link>
                <Link to="/register" onClick={handleLinkClick}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
