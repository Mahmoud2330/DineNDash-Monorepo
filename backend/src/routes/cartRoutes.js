const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

// Get cart contents
router.get('/users/:userId/restaurants/:restaurantId/cart', getCart);

// Add item to cart
router.post('/users/:userId/restaurants/:restaurantId/cart', addToCart);

// Update cart item quantity
router.put('/users/:userId/restaurants/:restaurantId/cart/:menuItemId', updateCartItem);

// Remove item from cart
router.delete('/users/:userId/restaurants/:restaurantId/cart/:menuItemId', removeFromCart);

// Clear cart
router.delete('/users/:userId/restaurants/:restaurantId/cart', clearCart);

module.exports = router; 