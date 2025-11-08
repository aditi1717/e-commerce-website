import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/ManageProducts.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products?limit=100');
      console.log('Fetched products:', response.data.products.length);
      response.data.products.forEach((p, index) => {
        console.log(`Product ${index + 1}: ${p.name} - Images:`, p.images);
      });
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      // Log image files being sent
      console.log('Image files to upload:', imageFiles.length);
      imageFiles.forEach((file, index) => {
        console.log(`Image ${index + 1}:`, file.name, file.size, 'bytes');
        formDataToSend.append('images', file);
      });

      let response;
      if (editingProduct) {
        response = await axios.put(`/api/products/${editingProduct._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Product updated response:', response.data);
        console.log('Product images after update:', response.data.images);
        
        // Check if images were uploaded
        if (imageFiles.length > 0 && (!response.data.images || response.data.images.length === 0)) {
          toast.warning('Product updated, but images were not uploaded. Check Cloudinary configuration in backend.');
        } else {
          toast.success('Product updated successfully');
        }
      } else {
        response = await axios.post('/api/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Product created response:', response.data);
        console.log('Product images after creation:', response.data.images);
        console.log('Product ID:', response.data._id);
        
        // Check if images were uploaded
        if (imageFiles.length > 0 && (!response.data.images || response.data.images.length === 0)) {
          toast.warning('Product created, but images were not uploaded. Check Cloudinary configuration in backend.');
        } else {
          toast.success('Product created successfully');
        }
      }

      resetForm();
      // Fetch products immediately to see the update
      await fetchProducts();
      
      // Also log the fetched products to verify images
      setTimeout(async () => {
        const freshProducts = await axios.get('/api/products?limit=100');
        console.log('Fresh products from server:', freshProducts.data.products);
        const createdProduct = freshProducts.data.products.find(p => p._id === response.data._id);
        if (createdProduct) {
          console.log('Created product in list:', createdProduct);
          console.log('Images in list:', createdProduct.images);
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images || []
    });
    setImageFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: []
    });
    setImageFiles([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="manage-products">
      <div className="container">
        <div className="page-header">
          <h1>Manage Products</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>

        {showForm && (
          <div className="product-form">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Images {editingProduct ? '(Add more)' : ''}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imageFiles.length > 0 && (
                  <div className="image-preview-section">
                    <p>Selected Images ({imageFiles.length}):</p>
                    <div className="image-preview-grid">
                      {imageFiles.map((file, index) => (
                        <img 
                          key={index} 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="existing-images">
                    <p>Existing Images:</p>
                    <div className="image-preview-grid">
                      {editingProduct.images.map((img, index) => (
                        <img key={index} src={img} alt={`Product ${index + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        onError={(e) => {
                          console.error('Image failed to load:', product.images[0]);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="no-image" style={{ display: 'none' }}>Image Error</div>
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;

