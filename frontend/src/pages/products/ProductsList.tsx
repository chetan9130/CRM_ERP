import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import type { ProductParams, StockAdjustmentData } from '../../api/products';
import type { Product, StockMovement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  ArrowLeftRight,
  Package,
  AlertTriangle,
  X
} from 'lucide-react';

export const ProductsList: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'warehouse';
  const canDelete = user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [activeAdjustProduct, setActiveAdjustProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const [activeHistoryProduct, setActiveHistoryProduct] = useState<Product | null>(null);
  const [historyLogs, setHistoryLogs] = useState<StockMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ProductParams = {
        page,
        limit,
        search: search.trim() || undefined,
        category: category || undefined,
        low_stock: lowStock || undefined
      };
      const response = await productsApi.getProducts(params);
      setProducts(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to load products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, category, lowStock]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }

    try {
      await productsApi.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to delete product.';
      alert(errMsg);
    }
  };

  // Adjust stock submission
  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjustProduct) return;

    setAdjustError(null);
    setAdjustSubmitting(true);

    try {
      const data: StockAdjustmentData = {
        quantity_changed: adjustQty,
        movement_type: adjustType,
        reason: adjustReason.trim() || `Manual stock adjustment (${adjustType})`
      };

      await productsApi.adjustStock(activeAdjustProduct.id, data);
      
      // Reset & close
      setActiveAdjustProduct(null);
      setAdjustQty(1);
      setAdjustType('IN');
      setAdjustReason('');
      
      // Refresh list
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to adjust stock.';
      setAdjustError(msg);
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Open history modal
  const openHistoryModal = async (product: Product) => {
    setActiveHistoryProduct(product);
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const logs = await productsApi.getProductMovements(product.id);
      setHistoryLogs(logs);
    } catch (err) {
      console.error(err);
      setHistoryError('Failed to load stock movements log.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Control bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search / Filter Forms */}
        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          flex: 1,
          maxWidth: '850px'
        }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              style={{ paddingLeft: '2.5rem', height: '40px' }}
            />
            <Search style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.1rem',
              height: '1.1rem',
              color: 'var(--text-muted)'
            }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal style={{ width: '0.95rem', height: '0.95rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              placeholder="Filter by Category"
              style={{ width: 'auto', minWidth: '150px', height: '40px' }}
            />
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => { setLowStock(e.target.checked); setPage(1); }}
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            Low Stock Alerts
          </label>
        </form>

        {/* Add Product Link */}
        {canEdit && (
          <Link to="/products/new" className="btn btn-primary" style={{ height: '40px', fontWeight: 700 }}>
            <Plus style={{ width: '1.1rem', height: '1.1rem' }} />
            Add Product
          </Link>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <Package style={{ width: '3rem', height: '3rem', marginBottom: '1rem', color: 'var(--text-muted)', opacity: 0.7 }} />
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>No Products Found</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>Try clearing filters or checking other categories.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>SKU</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Product Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Stock Level</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Min Alert</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.is_low_stock || (p.current_stock < p.min_stock_alert);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                          {p.sku}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{p.name}</span>
                          {isLow && (
                            <span className="badge badge-cancelled" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontWeight: 700 }}>
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: p.category ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                        {p.category || 'Uncategorized'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: p.location ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 500 }}>
                        {p.location || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ₹{Number(p.unit_price).toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: isLow ? 'var(--error)' : 'var(--success)' }}>
                        {p.current_stock}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {p.min_stock_alert}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Stock Movement History trigger */}
                          <button
                            onClick={() => openHistoryModal(p)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem' }}
                            title="Stock log history"
                          >
                            <History style={{ width: '0.95rem', height: '0.95rem' }} />
                          </button>
                          
                          {/* Adjust Stock Trigger */}
                          {canEdit && (
                            <button
                              onClick={() => setActiveAdjustProduct(p)}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--primary)' }}
                              title="Manual stock adjustment"
                            >
                              <ArrowLeftRight style={{ width: '0.95rem', height: '0.95rem' }} />
                            </button>
                          )}

                          {canEdit && (
                            <Link to={`/products/${p.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem' }} title="Edit details">
                              <Edit3 style={{ width: '0.95rem', height: '0.95rem' }} />
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: '#fee2e2' }}
                              title="Delete product"
                            >
                              <Trash2 style={{ width: '0.95rem', height: '0.95rem' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && products.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing {products.length} of {total} records
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                  style={{ padding: '0.25rem 0.5rem', width: 'auto', minWidth: '60px', height: '32px', fontSize: '0.8rem' }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', height: '32px' }}
                >
                  <ChevronLeft style={{ width: '0.95rem', height: '0.95rem' }} />
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', height: '32px' }}
                >
                  <ChevronRight style={{ width: '0.95rem', height: '0.95rem' }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL A: STOCK ADJUSTMENT */}
      {activeAdjustProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 38, 74, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', boxShadow: 'var(--shadow-lg)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 0 }}>Adjust Stock Level</h3>
              <button 
                onClick={() => { setActiveAdjustProduct(null); setAdjustError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '1.2rem', height: '1.2rem' }} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500 }}>
              Product: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{activeAdjustProduct.name}</span> ({activeAdjustProduct.sku})<br />
              Current Stock: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{activeAdjustProduct.current_stock}</span>
            </p>

            <form onSubmit={handleAdjustStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Type IN / OUT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adjustment Type</label>
                <select value={adjustType} onChange={(e) => setAdjustType(e.target.value as 'IN' | 'OUT')}>
                  <option value="IN">IN (Receive Stock)</option>
                  <option value="OUT">OUT (Issue / Shrinkage)</option>
                </select>
              </div>

              {/* Qty changed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity *</label>
                <input
                  type="number"
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              {/* Reason */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adjustment Reason *</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received shipment, Count mismatch"
                  required
                />
              </div>

              {adjustError && (
                <div style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'var(--error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                  {adjustError}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setActiveAdjustProduct(null);
                    setAdjustError(null);
                  }}
                  disabled={adjustSubmitting}
                  style={{ fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={adjustSubmitting} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  {adjustSubmitting ? <div className="spinner"></div> : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL B: STOCK MOVEMENTS LOG */}
      {activeHistoryProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 38, 74, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: 'var(--shadow-lg)', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Stock Movements Log</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                  {activeHistoryProduct.name} ({activeHistoryProduct.sku})
                </p>
              </div>
              <button 
                onClick={() => setActiveHistoryProduct(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '1.2rem', height: '1.2rem' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ width: '2rem', height: '2rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div>
                </div>
              ) : historyError ? (
                <div style={{ color: 'var(--error)', backgroundColor: 'var(--error-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                  {historyError}
                </div>
              ) : historyLogs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem', fontWeight: 500 }}>
                  No stock movements logged for this product.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historyLogs.map((log) => {
                    const isIN = log.movement_type === 'IN';
                    return (
                      <div key={log.id} style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderLeft: `4px solid ${isIN ? 'var(--success)' : 'var(--error)'}`,
                        padding: '0.9rem 1.1rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontWeight: 800,
                            color: isIN ? 'var(--success)' : 'var(--error)',
                            fontSize: '0.85rem'
                          }}>
                            {isIN ? '+' : '-'}{log.quantity_changed} {log.movement_type}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {new Date(log.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {log.reason}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontWeight: 500 }}>
                          <span>By: {log.created_by_name || 'System'}</span>
                          {log.created_by_role && (
                            <span className={`badge badge-${log.created_by_role}`} style={{ fontSize: '0.55rem', padding: '0 0.3rem' }}>
                              {log.created_by_role}
                            </span>
                          )}
                          {log.reference_type === 'challan' && (
                            <span style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: 'auto' }}>
                              Ref: Challan
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
