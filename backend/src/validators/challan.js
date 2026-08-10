const { z } = require('zod');

const createChallanSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID format'),
  items: z.array(
    z.object({
      product_id: z.string().uuid('Invalid product ID format'),
      quantity: z.number().int().positive('Quantity must be a positive integer')
    })
  ).min(1, 'At least one line item is required')
});

module.exports = {
  createChallanSchema
};
