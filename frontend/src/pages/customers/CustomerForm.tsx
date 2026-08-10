import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { customersApi } from '../../api/customers';
import type { CustomerType, CustomerStatus } from '../../types';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('retail');
  const [status, setStatus] = useState<CustomerStatus>('lead');
  const [address, setAddress] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Form Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isEditMode || !id) return;
      try {
        const c = await customersApi.getCustomer(id);
        setName(c.name);
        setMobile(c.mobile);
        setEmail(c.email || '');
        setBusinessName(c.business_name || '');
        setGstNumber(c.gst_number || '');
        setCustomerType(c.customer_type);
        setStatus(c.status);
        setAddress(c.address || '');
        
        // Format date string to YYYY-MM-DD for date input value
        if (c.follow_up_date) {
          const dateObj = new Date(c.follow_up_date);
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          setFollowUpDate(`${yyyy}-${mm}-${dd}`);
        } else {
          setFollowUpDate('');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch customer profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    setFieldErrors({});

    if (!name.trim()) errors.name = 'Name is required.';
    if (!mobile.trim()) errors.mobile = 'Mobile number is required.';
    
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (followUpDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(followUpDate)) {
        errors.followUpDate = 'Invalid date format.';
      }
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
        mobile: mobile.trim(),
        email: email.trim() || null,
        business_name: businessName.trim() || null,
        gst_number: gstNumber.toUpperCase().trim() || null,
        customer_type: customerType,
        status: status,
        address: address.trim() || null,
        follow_up_date: followUpDate || null
      };

      if (isEditMode && id) {
        await customersApi.updateCustomer(id, payload);
        navigate(`/customers/${id}`);
      } else {
        const newCust = await customersApi.createCustomer(payload);
        navigate(`/customers/${newCust.id}`);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        if (err.response.data.details) {
          setFieldErrors(err.response.data.details);
        }
      } else {
        setError('Server error while saving customer details.');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Link */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to={isEditMode ? `/customers/${id}` : '/customers'} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Cancel and Return
        </Link>
      </div>

      <div className="card" style={{ backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {isEditMode ? 'Edit Customer Profile' : 'Register New Customer'}
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
          
          {/* Two column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
                {fieldErrors.name && (
                  <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.name}</span>
                )}
              </div>

              {/* Mobile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. +91 9999999999"
                  required
                />
                {fieldErrors.mobile && (
                  <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.mobile}</span>
                )}
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@business.com"
                />
                {fieldErrors.email && (
                  <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.email}</span>
                )}
              </div>

              {/* Business Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Industries Ltd"
                />
              </div>

            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* GST Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  GST Number
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              {/* Customer Type Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>

              {/* Status Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Follow-up Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
                {fieldErrors.followUpDate && (
                  <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{fieldErrors.followUpDate}</span>
                )}
              </div>

            </div>

          </div>

          {/* Full-width Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Billing / Shipping Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address details..."
              rows={3}
            />
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
            <Link to={isEditMode ? `/customers/${id}` : '/customers'} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
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
                  Save Profile
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
