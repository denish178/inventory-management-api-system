const express = require('express');
const db = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - sku
 *         - quantity
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         type:
 *           type: string
 *           description: Product category/type
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit (unique identifier)
 *         image_url:
 *           type: string
 *           description: URL to product image
 *         description:
 *           type: string
 *           description: Product description
 *         quantity:
 *           type: integer
 *           minimum: 0
 *           description: Available quantity
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *     ProductResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         sku:
 *           type: string
 *         image_url:
 *           type: string
 *         description:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

// Apply authentication middleware to all product routes
router.use(authenticateToken);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product_id:
 *                   type: integer
 *       400:
 *         description: Missing required fields or invalid data
 *       401:
 *         description: Unauthorized - JWT token required
 *       409:
 *         description: SKU already exists
 *       500:
 *         description: Internal server error
 */
// Add new product
router.post('/', (req, res) => {
  const { name, type, sku, image_url, description, quantity, price } = req.body;

  // Validate required fields
  if (!name || !type || !sku || !quantity || !price) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name, type, SKU, quantity, and price are required'
    });
  }

  // Validate data types
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({
      error: 'Invalid quantity',
      message: 'Quantity must be a non-negative number'
    });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Price must be a non-negative number'
    });
  }

  // Insert product into database
  db.run(
    `INSERT INTO products (name, type, sku, image_url, description, quantity, price) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, type, sku, image_url || null, description || null, quantity, price],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({
            error: 'SKU already exists',
            message: 'A product with this SKU already exists'
          });
        }
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create product'
        });
      }

      res.status(201).json({
        message: 'Product created successfully',
        product_id: this.lastID
      });
    }
  );
});

/**
 * @swagger
 * /products/{id}/quantity:
 *   put:
 *     summary: Update product quantity
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: New quantity value
 *     responses:
 *       200:
 *         description: Product quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Invalid quantity value
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
// Update product quantity
router.put('/:id/quantity', (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  // Validate input
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({
      error: 'Invalid quantity',
      message: 'Quantity must be a non-negative number'
    });
  }

  // Check if product exists and update quantity
  db.run(
    'UPDATE products SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, productId],
    function(err) {
      if (err) {
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update product quantity'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'No product found with the specified ID'
        });
      }

      // Get updated product details
      db.get(
        'SELECT * FROM products WHERE id = ?',
        [productId],
        (err, product) => {
          if (err) {
            return res.status(500).json({
              error: 'Database error',
              message: 'Failed to retrieve updated product'
            });
          }

          res.json({
            message: 'Product quantity updated successfully',
            product: {
              id: product.id,
              name: product.name,
              type: product.type,
              sku: product.sku,
              image_url: product.image_url,
              description: product.description,
              quantity: product.quantity,
              price: product.price,
              updated_at: product.updated_at
            }
          });
        }
      );
    }
  );
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized - JWT token required
 *       500:
 *         description: Internal server error
 */
// Get all products with pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Invalid pagination parameters',
      message: 'Page must be >= 1, limit must be between 1 and 100'
    });
  }

  // Get total count for pagination
  db.get('SELECT COUNT(*) as total FROM products', (err, countResult) => {
    if (err) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to get products count'
      });
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Get products with pagination
    db.all(
      `SELECT * FROM products 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, products) => {
        if (err) {
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to retrieve products'
          });
        }

        res.json({
          products: products.map(product => ({
            id: product.id,
            name: product.name,
            type: product.type,
            sku: product.sku,
            image_url: product.image_url,
            description: product.description,
            quantity: product.quantity,
            price: product.price,
            created_at: product.created_at,
            updated_at: product.updated_at
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      }
    );
  });
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
// Get product by ID
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  db.get(
    'SELECT * FROM products WHERE id = ?',
    [productId],
    (err, product) => {
      if (err) {
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to retrieve product'
        });
      }

      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'No product found with the specified ID'
        });
      }

      res.json({
        product: {
          id: product.id,
          name: product.name,
          type: product.type,
          sku: product.sku,
          image_url: product.image_url,
          description: product.description,
          quantity: product.quantity,
          price: product.price,
          created_at: product.created_at,
          updated_at: product.updated_at
        }
      });
    }
  );
});

module.exports = router; 