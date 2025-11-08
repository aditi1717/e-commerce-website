import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import '../styles/ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const [userReview, setUserReview] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const userId = user?._id;

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      const response = await axios.get(`/api/reviews/product/${productId}`);
      setReviews(response.data);
      
      // Find user's review if authenticated
      if (isAuthenticated && userId) {
        const review = response.data.find(r => r.userId._id === userId);
        setUserReview(review);
        if (review) {
          setFormData({ rating: review.rating, comment: review.comment || '' });
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, isAuthenticated, userId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.info('Please login to submit a review');
      return;
    }

    try {
      await axios.post('/api/reviews', {
        productId,
        rating: formData.rating,
        comment: formData.comment
      });
      
      toast.success('Review submitted successfully');
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
      setUserReview(null);
      setFormData({ rating: 5, comment: '' });
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>Reviews ({reviews.length})</h2>
        {isAuthenticated && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {userReview ? 'Edit Review' : 'Write Review'}
          </button>
        )}
      </div>

      {showForm && isAuthenticated && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, rating: star })}
                >
                  ⭐
                </button>
              ))}
              <span className="rating-text">{formData.rating} out of 5</span>
            </div>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows="4"
              placeholder="Share your experience with this product..."
              maxLength={500}
            />
            <small>{formData.comment.length}/500 characters</small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {userReview ? 'Update Review' : 'Submit Review'}
            </button>
            {userReview && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(userReview._id)}
              >
                Delete Review
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false);
                if (userReview) {
                  setFormData({ rating: userReview.rating, comment: userReview.comment || '' });
                } else {
                  setFormData({ rating: 5, comment: '' });
                }
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <p className="login-prompt">Please login to write a review</p>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-item">
              <div className="review-header-item">
                <div>
                  <strong>{review.userId?.name || 'Anonymous'}</strong>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                </div>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;

