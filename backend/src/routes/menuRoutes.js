const express = require('express');
const router = express.Router();
const { 
  getMenuByRestaurantId, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require('../controllers/menuController');

// Get menu items for a specific restaurant
router.get('/restaurants/:restaurantId/menu', getMenuByRestaurantId);

// Create a new menu item
router.post('/menu-items', createMenuItem);

// Update a menu item
router.put('/menu-items/:id', updateMenuItem);

// Delete a menu item
router.delete('/menu-items/:id', deleteMenuItem);

module.exports = router;
