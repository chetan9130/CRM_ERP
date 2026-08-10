import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { challansApi } from '../../api/challans';
import type { CreateChallanInput } from '../../api/challans';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import type { Customer, Product } from '../../types';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface FormLineItem {
  product_id: string;
  quantity: number;
  // cached details for rendering
  sku?: string;
  name?: string;
  unit_price?: number;
  available_stock?: number;
}

export const ChallanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<FormLineItem[]>([
    { product_id: '', quantity: 1 }
  ]);

  // Inline row error states: maps product_id to error message
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMasterDataAndChallan = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all customers and products (we set high limits to fetch all for selection)
        const [customersData, productsData] = await Promise.all([
          customersApi.getCustomers({ limit: 100 }),
          productsApi.getProducts({ limit: 100 })
        ]);

        setCustomers(customersData.data);
        setProducts(productsData.data);

        // Prepopulate if editing
        if (isEditMode && id) {
          const detail = await challansApi.getChallan(id);
          
          if (detail.challan.status !== 'draft') {
            setError(`Challan ${detail.challan.challan_number} is already ${detail.challan.status} and cannot be modified.`);
            setLoading(false);
            return;
          }

          setCustomerId(detail.challan.customer_id);
          
          // Map backend items to form line items
          const mappedItems = detail.items.map((item) => {
            // Find current product in master list to get current available stock
            const matchedProd = productsData.data.find((p) => p.id === item.product_id);
            return {
              product_id: item.product_id,
              quantity: item.quantity,
              sku: item.product_sku_snapshot,
              name: item.product_name_snapshot,
              unit_price: typeof item.unit_price_snapshot === 'string' 
                ? parseFloat(item.unit_price_snapshot) 
                : item.unit_price_snapshot,
              available_stock: matchedProd ? matchedProd.current_stock : 0
            };
          });

          setItems(mappedItems.length > 0 ? mappedItems : [{ product_id: '', quantity: 1 }]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load form lookup data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMasterDataAndChallan();
  }, [id, isEditMode]);

  // Handle product selection in a row
  const handleProductChange = (index: number, productId: string) => {
    setInlineErrors({});
    const newItems = [...items];
    const selectedProd = products.find((p) => p.id === productId);

    if (selectedProd) {
      newItems[index] = {
        product_id: productId,
        quantity: newItems[index].quantity || 1,
        sku: selectedProd.sku,
        name: selectedProd.name,
        unit_price: typeof selectedProd.unit_price === 'string' 
          ? parseFloat(selectedProd.unit_price) 
          : selectedProd.unit_price,
        available_stock: selectedProd.current_stock
      };
    } else {
      newItems[index] = { product_id: '', quantity: 1 };
    }
    setItems(newItems);
  };

  // Handle quantity change in a row
  const handleQuantityChange = (index: number, quantity: number) => {
    setInlineErrors({});
    const newItems = [...items];
    newItems[index].quantity = Math.max(quantity, 1);
    setItems(newItems);
  };

  // Add new line item row
  const addLineItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  // Remove line item row
  const removeLineItem = (index: number) => {
    setInlineErrors({});
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length > 0 ? newItems : [{ product_id: '', quantity: 1 }]);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    setFormErrors({});

    if (!customerId) {
      errors.customerId = 'Please select a customer.';
    }

    const uniqueProductIds = new Set<string>();
    items.forEach((item, idx) => {
      if (!item.product_id) {
        errors[`item_${idx}`] = 'Please select a product.';
      } else if (uniqueProductIds.has(item.product_id)) {
        errors[`item_${idx}`] = 'Duplicate product row. Adjust quantities instead.';
      } else {
        uniqueProductIds.add(item.product_id);
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Draft saving
  const handleSaveDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInlineErrors({});

    if (!validateForm()) return null;

    setSaving(true);
    try {
      const payload: CreateChallanInput = {
        customer_id: customerId,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      let savedChallan;
      if (isEditMode && id) {
        savedChallan = await challansApi.updateChallan(id, payload);
      } else {
        savedChallan = await challansApi.createChallan(payload);
      }

      setSaving(false);
      return savedChallan;
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to save challan draft.';
      setError(msg);
      setSaving(false);
      return null;
    }
  };

  // Confirming and locking
  const handleConfirmAndLock = async () => {
    setError(null);
    setInlineErrors({});

    if (!validateForm()) return;

    setSaving(true);
    
    // 1. Save as Draft first
    const savedChallan = await handleSaveDraft();
    if (!savedChallan) {
      setSaving(false);
      return; // Error already set by handleSaveDraft
    }

    // 2. Call confirm on the saved challan
    try {
      await challansApi.confirmChallan(savedChallan.id);
      setSaving(false);
      // Redirect to details view on success
      navigate(`/challans/${savedChallan.id}`);
    } catch (err: any) {
      console.error(err);
      
      // Look for detailed insufficient stock error payload
      if (err.response && err.response.status === 400 && err.response.data) {
        const serverError = err.response.data;
        
        // If it includes the details object specifying which product failed
        if (serverError.details && serverError.details.product_id) {
          const { product_id, current_stock, requested_quantity } = serverError.details;
          
          // Map error to the matching product row
          const errors: Record<string, string> = {};
          errors[product_id] = `Stock short! Available: ${current_stock}, Requested: ${requested_quantity}.`;
          
          setInlineErrors(errors);
          setError(`Confirmation failed: Insufficient stock for product '${serverError.details.product_name}'. Adjust quantities and try again.`);
        } else {
          setError(serverError.error || 'Failed to confirm challan.');
        }
      } else {
        setError('Server error during challan confirmation.');
      }
      setSaving(false);
    }
  };

  // Direct Save button handler
  const handleSaveAndExit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSaveDraft();
    if (result) {
      navigate(`/challans/${result.id}`);
    }
  };

  // Computed Running Totals
  const runningTotalQty = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const runningTotalPrice = items.reduce((acc, item) => {
    const price = item.unit_price || 0;
    return acc + (price * (item.quantity || 0));
  }, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Back breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to={isEditMode ? `/challans/${id}` : '/challans'} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Cancel and Return
        </Link>
      </div>

      {/* Main card */}
      <div className="card" style={{ backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {isEditMode ? 'Edit Draft Challan' : 'Generate Sales Challan'}
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

        <form onSubmit={handleSaveAndExit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Customer select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '400px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.business_name ? `(${c.business_name})` : ''}
                </option>
              ))}
            </select>
            {formErrors.customerId && (
              <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600 }}>{formErrors.customerId}</span>
            )}
          </div>

          <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* Line items row editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Line Items</h3>

            {/* Headers row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 2fr) 110px 100px 100px 40px',
              gap: '1rem',
              alignItems: 'center',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              <span>Product Select</span>
              <span style={{ textAlign: 'right' }}>Quantity</span>
              <span style={{ textAlign: 'right' }}>Unit Price</span>
              <span style={{ textAlign: 'right' }}>Subtotal</span>
              <span></span>
            </div>

            {/* Row items mapping */}
            {items.map((item, index) => {
              const subtotal = (item.unit_price || 0) * (item.quantity || 0);
              const rowErr = inlineErrors[item.product_id];
              const formErr = formErrors[`item_${index}`];

              return (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(200px, 2fr) 110px 100px 100px 40px',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    {/* Product select */}
                    <div>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        required
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) - Stock: {p.current_stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity input */}
                    <div>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        required
                        style={{ textAlign: 'right' }}
                      />
                    </div>

                    {/* Unit price snapshot */}
                    <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {item.unit_price ? `₹${item.unit_price.toFixed(2)}` : '₹0.00'}
                    </div>

                    {/* Subtotal computed */}
                    <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{subtotal.toFixed(2)}
                    </div>

                    {/* Delete button */}
                    <div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeLineItem(index)}
                        style={{
                          padding: '0.4rem',
                          color: 'var(--error)',
                          border: 'none',
                          background: 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 style={{ width: '1.1rem', height: '1.1rem' }} />
                      </button>
                    </div>
                  </div>

                  {/* Stock indicators and inline errors */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem', fontSize: '0.75rem' }}>
                    {/* Stock indicator */}
                    {item.product_id && (
                      <span style={{
                        color: (item.available_stock || 0) < item.quantity ? 'var(--error)' : 'var(--success)',
                        fontWeight: 600
                      }}>
                        Available Stock: {item.available_stock || 0} units
                      </span>
                    )}

                    {/* Row duplicate validator checks */}
                    {formErr && (
                      <span style={{ color: 'var(--error)', fontWeight: 600, marginLeft: 'auto' }}>{formErr}</span>
                    )}

                    {/* Transaction stock error returned from confirm */}
                    {rowErr && (
                      <span style={{
                        color: 'var(--error)',
                        fontWeight: 700,
                        backgroundColor: 'var(--error-bg)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        marginLeft: 'auto'
                      }}>
                        {rowErr}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add row button */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addLineItem}
              style={{
                alignSelf: 'flex-start',
                padding: '0.4rem 1rem',
                fontSize: '0.8rem',
                marginTop: '0.5rem',
                fontWeight: 600
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add Product Line
            </button>
          </div>

          {/* Totals Summary Footer */}
          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '1.5rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '280px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Quantities:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{runningTotalQty} units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Grand Total Price:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{runningTotalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}>
            <Link to={isEditMode ? `/challans/${id}` : '/challans'} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
              Cancel
            </Link>

            <button
              type="submit"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1.5rem', color: 'var(--primary)', fontWeight: 600 }}
              disabled={saving}
            >
              {saving ? <div className="spinner"></div> : 'Save Draft'}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmAndLock}
              style={{ padding: '0.5rem 1.5rem', fontWeight: 700 }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle style={{ width: '1.1rem', height: '1.1rem' }} />
                  Save & Confirm
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default ChallanForm;
