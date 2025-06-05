const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cache = require('../services/cacheService');

// Get restaurant details by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `restaurant:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        themeColor: true,
        bgColor: true,
      }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    cache.set(cacheKey, restaurant, 300); // 5 min TTL
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get restaurant menu items
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `restaurant:${id}:menu`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: id },
      orderBy: { category: 'asc' }
    });

    cache.set(cacheKey, menuItems, 60); // 1 min TTL
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 