import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customersApi } from '../../api/customers';
import type { Customer, CustomerNote } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Edit3, 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  FileText, 
  MessageSquare
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canAddNote = user?.role === 'admin' || user?.role === 'sales';
  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [customerData, notesData] = await Promise.all([
        customersApi.getCustomer(id),
        customersApi.getCustomerNotes(id)
      ]);
      setCustomer(customerData);
      setNotes(notesData);
    } catch (err) {
      console.error(err);
      setError('Failed to load customer profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;

    setSubmittingNote(true);
    setNoteError(null);
    try {
      const addedNote = await customersApi.addCustomerNote(id, newNote.trim());
      // Prepend the new note to the top of the timeline
      setNotes((prevNotes) => [addedNote, ...prevNotes]);
      setNewNote('');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setNoteError(err.response.data.error);
      } else {
        setNoteError('Failed to add note.');
      }
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          {error || 'Customer profile not found.'}
        </div>
        <Link to="/customers" className="btn btn-secondary" style={{ width: 'fit-content' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header breadcrumb & back links */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/customers" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Directory
        </Link>
        {canEdit && (
          <Link to={`/customers/${customer.id}/edit`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Edit3 style={{ width: '1rem', height: '1rem' }} />
            Edit Profile
          </Link>
        )}
      </div>

      {/* Main Layout Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Card: Customer Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: 0, fontWeight: 800, color: 'var(--text-primary)' }}>
                {customer.name}
              </h1>
              <span className={`badge badge-${customer.status}`}>
                {customer.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
              {customer.business_name || 'Individual Customer'}
            </p>
          </div>

          <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* Profile Fields Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Customer Type:</span>
              <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{customer.customer_type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Mobile Number:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.mobile}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Email Address:</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{customer.email || 'None'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>GST Number:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{customer.gst_number || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Follow-up Date:</span>
              <span style={{ fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar style={{ width: '0.95rem', height: '0.95rem' }} />
                {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'None scheduled'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Address:</span>
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontWeight: 500, backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {customer.address || 'No address logged.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Interaction Log & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Add Note Form */}
          {canAddNote && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare style={{ width: '1.1rem', height: '1.1rem', color: 'var(--primary)' }} />
                Add Interaction Note
              </h3>
              <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log details of call, meeting, or transaction follow-ups..."
                  rows={3}
                  required
                  disabled={submittingNote}
                />
                {noteError && (
                  <div style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {noteError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-end', padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 700 }}
                  disabled={submittingNote || !newNote.trim()}
                >
                  {submittingNote ? (
                    <>
                      <div className="spinner"></div>
                      Adding Note...
                    </>
                  ) : (
                    'Add Note'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Notes Timeline List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ width: '1.1rem', height: '1.1rem', color: 'var(--primary)' }} />
              Interaction Timeline
            </h3>

            {notes.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                No notes have been logged for this customer.
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '450px',
                overflowY: 'auto',
                paddingRight: '0.25rem'
              }}>
                {notes.map((n) => (
                  <div key={n.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{n.created_by_name || 'System'}</span>
                        {n.created_by_role && (
                          <span className={`badge badge-${n.created_by_role}`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>
                            {n.created_by_role}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {new Date(n.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontWeight: 500 }}>
                      {n.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
