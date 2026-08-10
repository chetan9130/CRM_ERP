import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challansApi } from '../../api/challans';
import type { ChallanParams } from '../../api/challans';
import type { SalesChallan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  FileText,
  XCircle
} from 'lucide-react';

export const ChallansList: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchChallans = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ChallanParams = {
        page,
        limit,
        status: status || undefined
      };
      const response = await challansApi.getChallans(params);
      setChallans(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to load sales challans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, limit, status]);

  const handleCancel = async (id: string, challanNumber: string, challanStatus: string) => {
    const confirmMessage = challanStatus === 'confirmed'
      ? `Are you sure you want to CANCEL confirmed challan "${challanNumber}"? This will REVERSE inventory stocks and log IN movements!`
      : `Are you sure you want to cancel draft challan "${challanNumber}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await challansApi.cancelChallan(id);
      fetchChallans();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to cancel challan.';
      alert(errMsg);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Filters & Create header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter style={{ width: '0.95rem', height: '0.95rem', color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Status:</span>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ width: 'auto', minWidth: '150px', height: '40px' }}
          >
            <option value="">All Challans</option>
            <option value="draft">Drafts</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Generate Link */}
        {canEdit && (
          <Link to="/challans/new" className="btn btn-primary" style={{ height: '40px', fontWeight: 700 }}>
            <Plus style={{ width: '1.1rem', height: '1.1rem' }} />
            Generate Challan
          </Link>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Table grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
          </div>
        ) : challans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <FileText style={{ width: '3rem', height: '3rem', marginBottom: '1rem', color: 'var(--text-muted)', opacity: 0.7 }} />
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>No Challans Found</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>No records match the selected status.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Challan Number</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Customer Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Created By</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Total Qty</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Date Created</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Link to={`/challans/${c.id}`} style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>
                        {c.challan_number}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.customer_name}</span>
                        {c.customer_business_name && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {c.customer_business_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {c.created_by_name || 'System'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.total_quantity}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {new Date(c.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge badge-${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link to={`/challans/${c.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem' }} title="View details">
                          <Eye style={{ width: '0.95rem', height: '0.95rem' }} />
                        </Link>
                        {canEdit && c.status === 'draft' && (
                          <Link to={`/challans/${c.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--primary)' }} title="Edit draft">
                            <Edit3 style={{ width: '0.95rem', height: '0.95rem' }} />
                          </Link>
                        )}
                        {canEdit && (c.status === 'draft' || c.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancel(c.id, c.challan_number, c.status)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: '#fee2e2' }}
                            title="Cancel challan"
                          >
                            <XCircle style={{ width: '0.95rem', height: '0.95rem' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loading && challans.length > 0 && (
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
              Showing {challans.length} of {total} records
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
    </div>
  );
};
export default ChallansList;
