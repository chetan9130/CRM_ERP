const { z } = require('zod');

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name must be under 150 characters'),
  mobile: z.string().min(1, 'Mobile number is required').max(20, 'Mobile must be under 20 characters'),
  email: z.string().email('Invalid email address').max(160, 'Email must be under 160 characters').nullable().optional().or(z.literal('')),
  business_name: z.string().max(150, 'Business name must be under 150 characters').nullable().optional(),
  gst_number: z.string().max(20, 'GST number must be under 20 characters').nullable().optional(),
  customer_type: z.enum(['retail', 'wholesale', 'distributor'], {
    errorMap: () => ({ message: 'Customer type must be retail, wholesale, or distributor' })
  }),
  address: z.string().nullable().optional(),
  status: z.enum(['lead', 'active', 'inactive'], {
    errorMap: () => ({ message: 'Status must be lead, active, or inactive' })
  }).default('lead'),
  follow_up_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').nullable().optional().or(z.literal(''))
});

const noteSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty')
});

module.exports = {
  customerSchema,
  noteSchema
};
