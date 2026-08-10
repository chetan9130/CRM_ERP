import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState<string>('0.00');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(0);
  const [location, setLocation] = useState('');

  // Form Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditMode || !id) return;
      try {
        const p = await productsApi.getProduct(id);
        setName(p.name);
        setSku(p.sku);
        setCategory(p.category || '');
        setUnitPrice(Number(p.unit_price).toFixed(2));
        setCurrentStock(p.current_stock);
        setMinStockAlert(p.min_stock_alert);
        setLocation(p.location || '');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    setFieldErrors({});

    if (!name.trim()) errors.name = 'Product name is required.';
    if (!sku.trim()) errors.sku = 'Product SKU is required.';
    
    const priceNum = parseFloat(unitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.unitPrice = 'Unit price must be a number greater than or equal to 0.';
    }

    if (!isEditMode) {
      if (currentStock < 0) {
        errors.currentStock = 'Initial stock level cannot be negative.';
      }
    }

    if (minStockAlert < 0) {
      errors.minStockAlert = 'Min stock alert level cannot be negative.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.toUpperCase().trim(),
        category: category.trim() || null,
        unit_price: parseFloat(unitPrice),
        current_stock: currentStock,
        min_stock_alert: minStockAlert,
        location: location.trim() || null
      };

      if (isEditMode && id) {
        await productsApi.updateProduct(id, payload);
      } else {
        await productsApi.createProduct(payload);
      }

      navigate('/products');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        if (err.response.data.details) {
          setFieldErrors(err.response.data.details);
        }
      } else {
        setError('Server error while saving product details.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Back Link */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Cancel and Return
        </Link>
      </div>

      <div className="card" style={{ backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {isEditMode ? 'Edit Product Details' : 'Add New Product'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <AlertCircle style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* SKU */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Product SKU *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. PROD-WHP-001"
              required
              disabled={isEditMode} // Cannot edit SKU once created
              style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}
            />
            {fieldErrors.sku && (
              <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.sku}</span>
            )}
          </div>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Premium Wireless Headphones"
              required
            />
            {fieldErrors.name && (
              <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.name}</span>
            )}
          </div>

          {/* Category & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Electronics, Furniture"
              />
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Warehouse Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle 3, Shelf B"
              />
            </div>

          </div>

          {/* Price & Stocks grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            
            {/* Unit Price */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Unit Price (₹) *
              </label>
              <input
                type="text"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
                required
              />
              {fieldErrors.unitPrice && (
                <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.unitPrice}</span>
              )}
            </div>

            {/* Current Stock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Current Stock *
              </label>
              <input
                type="number"
                min={0}
                value={currentStock}
                onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                required
                disabled={isEditMode} // Disable in edit mode to encourage adjustment logs
              />
              {isEditMode && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.1rem', lineHeight: '1.3', fontWeight: 500 }}>
                  Use Adjust Stock on the main page for edits.
                </span>
              )}
              {fieldErrors.currentStock && (
                <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.currentStock}</span>
              )}
            </div>

            {/* Min Stock Alert */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Min Stock Alert Level *
              </label>
              <input
                type="number"
                min={0}
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 0)}
                required
              />
              {fieldErrors.minStockAlert && (
                <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.minStockAlert}</span>
              )}
            </div>

          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.5rem', fontWeight: 700 }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save style={{ width: '1.1rem', height: '1.1rem' }} />
                  Save Product
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
