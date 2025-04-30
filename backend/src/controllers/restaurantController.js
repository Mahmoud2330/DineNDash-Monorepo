const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new restaurant
const createRestaurant = async (req, res) => {
  try {
    const { name, description, logo, themeColor, bgColor } = req.body;
    
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description,
        logo,
        themeColor,
        bgColor,
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

module.exports = {
  createRestaurant,
}; 