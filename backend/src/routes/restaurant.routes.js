const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');

// Get restaurant details
router.get('/:id', restaurantController.getRestaurantById);

// Get restaurant menu items
router.get('/:id/menu', restaurantController.getRestaurantMenu);

module.exports = router; 