import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challansApi } from '../../api/challans';
import type { ChallanDetailsResponse } from '../../api/challans';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  Calendar,
  User,
  ShoppingBag,
  Info
} from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  const [details, setDetails] = useState<ChallanDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await challansApi.getChallan(id);
      setDetails(response);
    } catch (err) {
      console.error(err);
      setError('Failed to load sales challan details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleConfirm = async () => {
    if (!id || !details) return;
    if (!window.confirm(`Are you sure you want to CONFIRM challan "${details.challan.challan_number}"? This will decrement product stocks and lock the record!`)) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await challansApi.confirmChallan(id);
      fetchDetails();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to confirm challan.';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !details) return;
    const confirmMessage = details.challan.status === 'confirmed'
      ? `Are you sure you want to CANCEL confirmed challan "${details.challan.challan_number}"? This will REVERSE stocks and log IN movements!`
      : `Are you sure you want to cancel draft challan "${details.challan.challan_number}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await challansApi.cancelChallan(id);
      fetchDetails();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to cancel challan.';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          {error || 'Sales challan not found.'}
        </div>
        <Link to="/challans" className="btn btn-secondary" style={{ width: 'fit-content' }}>
          Back to List
        </Link>
      </div>
    );
  }

  const { challan, items } = details;

  // Compute Grand Total price based on unit price snapshots and quantities
  const grandTotalPrice = items.reduce((acc, item) => {
    const price = typeof item.unit_price_snapshot === 'string' 
      ? parseFloat(item.unit_price_snapshot) 
      : item.unit_price_snapshot;
    return acc + (price * item.quantity);
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Navigation header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/challans" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Challans List
        </Link>

        {/* Form Actions depending on status */}
        {canEdit && challan.status === 'draft' && (
          <Link to={`/challans/${challan.id}/edit`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            <Edit3 style={{ width: '1rem', height: '1rem' }} />
            Edit Draft
          </Link>
        )}
      </div>

      {/* Main Info Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff' }}>
        
        {/* Header Grid */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: 0, fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-primary)' }}>
                {challan.challan_number}
              </h1>
              <span className={`badge badge-${challan.status}`}>
                {challan.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
              Customer: <strong style={{ color: 'var(--text-primary)' }}>{challan.customer_name}</strong>
              {challan.customer_business_name && ` (${challan.customer_business_name})`}
            </p>
          </div>

          {/* Core Action triggers */}
          {canEdit && (challan.status === 'draft' || challan.status === 'confirmed') && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {challan.status === 'draft' && (
                <button
                  onClick={handleConfirm}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <div className="spinner"></div> : (
                    <>
                      <CheckCircle style={{ width: '1.1rem', height: '1.1rem' }} />
                      Confirm & Lock
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--error)', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}
                disabled={actionLoading}
              >
                {actionLoading ? <div className="spinner"></div> : (
                  <>
                    <XCircle style={{ width: '1.1rem', height: '1.1rem' }} />
                    Cancel Challan
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {actionError && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <AlertCircle style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0 }} />
            <span>{actionError}</span>
          </div>
        )}

        <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--border-color)' }} />

        {/* Metadata Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <User style={{ width: '0.95rem', height: '0.95rem' }} />
              Created By:
            </span>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{challan.created_by_name || 'System'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <Calendar style={{ width: '0.95rem', height: '0.95rem' }} />
              Date Created:
            </span>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Date(challan.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          {challan.confirmed_at && (
            <div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <CheckCircle style={{ width: '0.95rem', height: '0.95rem', color: 'var(--success)' }} />
                Confirmed At:
              </span>
              <p style={{ fontWeight: 700, color: 'var(--success)' }}>
                {new Date(challan.confirmed_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          )}
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <ShoppingBag style={{ width: '0.95rem', height: '0.95rem' }} />
              Total Line Items:
            </span>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{items.length} products</p>
          </div>
        </div>
      </div>

      {/* Line Items Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <h3 style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info style={{ width: '1.1rem', height: '1.1rem', color: 'var(--primary)' }} />
          Line Items Snapshot
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>SKU (Snapshot)</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Product Name (Snapshot)</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Quantity</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Subtotal</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const price = typeof item.unit_price_snapshot === 'string' 
                  ? parseFloat(item.unit_price_snapshot) 
                  : item.unit_price_snapshot;
                const subtotal = price * item.quantity;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.9rem 1.5rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {item.product_sku_snapshot}
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.product_name_snapshot}
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem', textAlign: 'right', fontWeight: 500 }}>
                      ₹{price.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{subtotal.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem', fontFamily: 'monospace', color: item.location ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                      {item.location || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary Footer */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '260px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Quantity:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{challan.total_quantity} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Grand Total:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{grandTotalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ChallanDetail;
