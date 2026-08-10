import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customersApi } from '../../api/customers';
import type { CustomerParams } from '../../api/customers';
import type { Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Users,
  Filter
} from 'lucide-react';

export const CustomersList: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'sales';
  const canDelete = user?.role === 'admin';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & pagination states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CustomerParams = {
        page,
        limit,
        search: search.trim() || undefined,
        status: status || undefined,
        customer_type: customerType || undefined
      };
      const response = await customersApi.getCustomers(params);
      setCustomers(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, limit, status, type changes
  useEffect(() => {
    fetchCustomers();
  }, [page, limit, status, customerType]);

  // Trigger search on form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return;
    }

    try {
      await customersApi.deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete customer. Make sure they have no associated notes or challans.');
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
        {/* Search & Filter Form */}
        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          flex: 1,
          maxWidth: '800px'
        }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <Filter style={{ width: '0.95rem', height: '0.95rem', color: 'var(--text-muted)' }} />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: '130px', height: '40px' }}
            >
              <option value="">All Statuses</option>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <select
            value={customerType}
            onChange={(e) => { setCustomerType(e.target.value); setPage(1); }}
            style={{ width: 'auto', minWidth: '150px', height: '40px' }}
          >
            <option value="">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
          </select>

          <button type="submit" className="btn btn-secondary" style={{ height: '40px', padding: '0 1rem' }}>
            Search
          </button>
        </form>

        {/* Create Link */}
        {canEdit && (
          <Link to="/customers/new" className="btn btn-primary" style={{ height: '40px', fontWeight: 700 }}>
            <Plus style={{ width: '1.1rem', height: '1.1rem' }} />
            Add Customer
          </Link>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Main Card & Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <Users style={{ width: '3rem', height: '3rem', marginBottom: '1rem', color: 'var(--text-muted)', opacity: 0.7 }} />
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>No Customers Found</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Customer Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Business Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Contact Info</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Follow-up Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Link to={`/customers/${c.id}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {c.name}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: c.business_name ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                      {c.business_name || 'Individual'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span>{c.mobile}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.email || 'No email registered'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {c.customer_type}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge badge-${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: c.follow_up_date ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                      {c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'None'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link to={`/customers/${c.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem' }} title="View details">
                          <Eye style={{ width: '0.95rem', height: '0.95rem' }} />
                        </Link>
                        {canEdit && (
                          <Link to={`/customers/${c.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem' }} title="Edit profile">
                            <Edit3 style={{ width: '0.95rem', height: '0.95rem' }} />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: '#fee2e2' }}
                            title="Delete profile"
                          >
                            <Trash2 style={{ width: '0.95rem', height: '0.95rem' }} />
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

        {/* Pagination bar */}
        {!loading && customers.length > 0 && (
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
              Showing {customers.length} of {total} records
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Limit selector */}
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

              {/* Prev / Next buttons */}
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
