const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Create new order
router.post('/', orderController.createOrder);

// Create order from cart
router.post('/from-cart', orderController.createOrderFromCart);

// Get user's orders
router.get('/user', orderController.getUserOrders);

// Get specific order
router.get('/:id', orderController.getOrder);

// Get all orders for a specific table
router.get('/table/:tableId', orderController.getTableOrders);

// Calculate split for an order
router.post('/:orderId/split', orderController.calculateOrderSplit);

// Set payment method for an order
router.post('/:orderId/payment', orderController.setPaymentMethod);

// Get payment status
router.get('/:orderId/payment-status', orderController.getPaymentStatus);

// Add items to existing order
router.post('/:orderId/add-items', orderController.addToExistingOrder);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// Update order item special note
router.patch('/:orderId/items/:itemId/note', orderController.updateOrderItemNote);

// Confirm cash payment (admin/waiter endpoint)
router.post('/payment/:paymentId/confirm', orderController.confirmCashPayment);

module.exports = router; 