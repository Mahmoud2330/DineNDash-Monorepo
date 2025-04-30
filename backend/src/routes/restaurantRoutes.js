const express = require('express');
const router = express.Router();
const { createRestaurant } = require('../controllers/restaurantController');

// Create a new restaurant
router.post('/restaurants', createRestaurant);

module.exports = router; 