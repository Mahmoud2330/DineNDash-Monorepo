const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get user's cart for a specific restaurant
router.get('/restaurants/:restaurantId', cartController.getCart);

// Add item to cart
router.post('/restaurants/:restaurantId/items', cartController.addToCart);

// Update cart item
router.patch('/restaurants/:restaurantId/items/:itemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/restaurants/:restaurantId/items/:itemId', cartController.removeFromCart);

// Clear cart for a specific restaurant
router.delete('/restaurants/:restaurantId', cartController.clearCart);

module.exports = router; 