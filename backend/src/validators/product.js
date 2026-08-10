const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(150, 'Name must be under 150 characters'),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be under 50 characters'),
  category: z.string().max(80, 'Category must be under 80 characters').nullable().optional().or(z.literal('')),
  unit_price: z.number().min(0, 'Unit price must be greater than or equal to 0'),
  current_stock: z.number().int().min(0, 'Current stock must be greater than or equal to 0').default(0),
  min_stock_alert: z.number().int().min(0, 'Min stock alert must be greater than or equal to 0').default(0),
  location: z.string().max(100, 'Location must be under 100 characters').nullable().optional().or(z.literal(''))
});

const stockAdjustmentSchema = z.object({
  quantity_changed: z.number().int().positive('Quantity changed must be a positive integer'),
  movement_type: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: "Movement type must be 'IN' or 'OUT'" })
  }),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason must be under 200 characters')
});

module.exports = {
  productSchema,
  stockAdjustmentSchema
};
