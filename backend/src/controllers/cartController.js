const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get or create cart for user and restaurant
const getOrCreateCart = async (userId, restaurantId) => {
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      restaurantId,
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        restaurantId,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  return cart;
};

// Get cart contents
const getCart = async (req, res) => {
  try {
    const { userId, restaurantId } = req.params;

    const cart = await getOrCreateCart(userId, restaurantId);
    
    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.quantity * item.menuItem.price);
    }, 0);

    res.json({
      ...cart,
      total,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { userId, restaurantId } = req.params;
    const { menuItemId, quantity } = req.body;

    // Validate menu item exists and belongs to the restaurant
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurantId,
        isAvailable: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found or not available' });
    }

    const cart = await getOrCreateCart(userId, restaurantId);

    // Update or create cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        menuItemId,
        quantity,
      },
      include: {
        menuItem: true,
      },
    });

    res.json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { userId, restaurantId, menuItemId } = req.params;
    const { quantity } = req.body;

    const cart = await getOrCreateCart(userId, restaurantId);

    if (quantity > 0) {
      // Update quantity
      const cartItem = await prisma.cartItem.update({
        where: {
          cartId_menuItemId: {
            cartId: cart.id,
            menuItemId,
          },
        },
        data: {
          quantity,
        },
        include: {
          menuItem: true,
        },
      });
      res.json(cartItem);
    } else {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: {
          cartId_menuItemId: {
            cartId: cart.id,
            menuItemId,
          },
        },
      });
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { userId, restaurantId, menuItemId } = req.params;

    const cart = await getOrCreateCart(userId, restaurantId);

    await prisma.cartItem.delete({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const { userId, restaurantId } = req.params;

    const cart = await getOrCreateCart(userId, restaurantId);

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}; 