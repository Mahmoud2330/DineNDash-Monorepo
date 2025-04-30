const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get menu items for a specific restaurant
const getMenuByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        category: 'asc',
      },
    });

    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// Create a new menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, restaurantId } = req.body;
    
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        restaurantId,
      },
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, isAvailable } = req.body;
    
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        image,
        category,
        isAvailable,
      },
    });

    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.menuItem.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

module.exports = {
  getMenuByRestaurantId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
