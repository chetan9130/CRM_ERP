import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import { challansApi } from '../api/challans';
import type { Customer, SalesChallan } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  FileText, 
  UserPlus, 
  Plus, 
  ShoppingBag, 
  TrendingUp, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    draftChallans: 0
  });

  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [recentChallans, setRecentChallans] = useState<SalesChallan[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          customersRes,
          productsRes,
          lowStockRes,
          draftChallansRes,
          recentCustomersRes,
          recentChallansRes
        ] = await Promise.all([
          customersApi.getCustomers({ limit: 1 }),
          productsApi.getProducts({ limit: 1 }),
          productsApi.getProducts({ limit: 1, low_stock: true }),
          challansApi.getChallans({ limit: 1, status: 'draft' }),
          customersApi.getCustomers({ limit: 5 }),
          challansApi.getChallans({ limit: 5 })
        ]);

        setStats({
          customers: customersRes.pagination.total,
          products: productsRes.pagination.total,
          lowStock: lowStockRes.pagination.total,
          draftChallans: draftChallansRes.pagination.total
        });

        setRecentCustomers(recentCustomersRes.data);
        setRecentChallans(recentChallansRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to aggregate dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
          Welcome back, {user?.name} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
          Here's an overview of your operations today. Account Role: <span style={{ textTransform: 'capitalize', fontWeight: 700, color: 'var(--primary)' }}>{user?.role}</span>
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        
        {/* Total Customers */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(8, 120, 249, 0.08)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Customers
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1.2, color: 'var(--text-primary)' }}>
              {stats.customers}
            </h2>
          </div>
        </div>

        {/* Total Products */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(8, 120, 249, 0.08)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Package style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Products
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1.2, color: 'var(--text-primary)' }}>
              {stats.products}
            </h2>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '1.5rem',
          borderColor: stats.lowStock > 0 ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-color)',
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: stats.lowStock > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-base)',
            color: stats.lowStock > 0 ? 'var(--error)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Low Stock Alerts
            </span>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
              color: stats.lowStock > 0 ? 'var(--error)' : 'var(--text-primary)'
            }}>
              {stats.lowStock}
            </h2>
          </div>
        </div>

        {/* Draft Challans */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 185, 0, 0.08)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Draft Challans
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1.2, color: 'var(--text-primary)' }}>
              {stats.draftChallans}
            </h2>
          </div>
        </div>

      </div>

      {/* Analytics Charts Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Sales Overview Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.1rem', color: 'var(--text-primary)' }}>Sales Performance</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Daily transaction tracking index</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700 }}>
              <TrendingUp style={{ width: '0.95rem', height: '0.95rem' }} />
              <span>+18.4%</span>
            </div>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
            <svg viewBox="0 0 500 160" width="100%" height="160" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0878F9" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#0878F9" stopOpacity="0.00"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="40" x2="500" y2="40" stroke="#E2E8F0" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeDasharray="4 4" />
              
              <path d="M 0 130 C 80 130, 120 70, 180 80 C 240 90, 280 40, 360 30 C 440 20, 460 100, 500 50 L 500 160 L 0 160 Z" fill="url(#salesGrad)" />
              <path d="M 0 130 C 80 130, 120 70, 180 80 C 240 90, 280 40, 360 30 C 440 20, 460 100, 500 50" fill="none" stroke="#0878F9" strokeWidth="3" />
              
              <circle cx="180" cy="80" r="5" fill="#FFFFFF" stroke="#0878F9" strokeWidth="2.5" />
              <circle cx="360" cy="30" r="5" fill="#FFFFFF" stroke="#0878F9" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Inventory Stock Levels Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.1rem', color: 'var(--text-primary)' }}>Stock Status</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Available inventory warehouse distribution</p>
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
            <svg viewBox="0 0 400 160" width="100%" height="160" style={{ overflow: 'visible' }}>
              <line x1="0" y1="40" x2="400" y2="40" stroke="#E2E8F0" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#E2E8F0" strokeDasharray="4 4" />

              {/* WHP */}
              <rect x="40" y="45" width="28" height="115" rx="4" fill="var(--primary)" />
              {/* OCH */}
              <rect x="120" y="95" width="28" height="65" rx="4" fill="#3B82F6" />
              {/* MKB */}
              <rect x="200" y="110" width="28" height="50" rx="4" fill="var(--error)" />
              {/* USB */}
              <rect x="280" y="20" width="28" height="140" rx="4" fill="var(--success)" />
              {/* MAT */}
              <rect x="360" y="130" width="28" height="30" rx="4" fill="var(--warning)" />

              <text x="54" y="175" fontSize="10" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">WHP</text>
              <text x="134" y="175" fontSize="10" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">OCH</text>
              <text x="214" y="175" fontSize="10" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">MKB</text>
              <text x="294" y="175" fontSize="10" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">USB</text>
              <text x="374" y="175" fontSize="10" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">MAT</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Main layout content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        
        {/* Left Column: Recent customers directory */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)' }}>Recent CRM Accounts</h3>
            <Link to="/customers" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View Directory</span>
              <ArrowRight style={{ width: '0.95rem', height: '0.95rem' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentCustomers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 1rem', textAlign: 'center', fontWeight: 500 }}>
                No customer profiles registered.
              </p>
            ) : (
              recentCustomers.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div>
                    <Link to={`/customers/${c.id}`} style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {c.name}
                    </Link>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 500 }}>
                      {c.business_name || 'Individual'} • {c.mobile}
                    </span>
                  </div>
                  <span className={`badge badge-${c.status}`} style={{ fontSize: '0.65rem' }}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Sales Challans */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)' }}>Recent Challans</h3>
            <Link to="/challans" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All Logs</span>
              <ArrowRight style={{ width: '0.95rem', height: '0.95rem' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentChallans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 1rem', textAlign: 'center', fontWeight: 500 }}>
                No sales challans recorded.
              </p>
            ) : (
              recentChallans.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div>
                    <Link to={`/challans/${c.id}`} style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {c.challan_number}
                    </Link>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 500 }}>
                      For: {c.customer_name} • {c.total_quantity} units
                    </span>
                  </div>
                  <span className={`badge badge-${c.status}`} style={{ fontSize: '0.65rem' }}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)' }}>Quick Actions Center</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Register Customer */}
          {(user?.role === 'admin' || user?.role === 'sales') && (
            <Link to="/customers/new" className="btn btn-secondary" style={{ 
              padding: '1rem', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              textAlign: 'left', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Register Customer</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Create new sales leads profiles</span>
            </Link>
          )}

          {/* Add Product */}
          {(user?.role === 'admin' || user?.role === 'warehouse') && (
            <Link to="/products/new" className="btn btn-secondary" style={{ 
              padding: '1rem', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              textAlign: 'left', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Add Product</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Log new products into database</span>
            </Link>
          )}

          {/* Generate Challan */}
          {(user?.role === 'admin' || user?.role === 'sales') && (
            <Link to="/challans/new" className="btn btn-secondary" style={{ 
              padding: '1rem', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              textAlign: 'left', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Generate Challan</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Draft shipment orders</span>
            </Link>
          )}

          {/* View Inventory */}
          <Link to="/products" className="btn btn-secondary" style={{ 
            padding: '1rem', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            textAlign: 'left', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>View Inventory</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Check stocks, categories & locations</span>
          </Link>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
