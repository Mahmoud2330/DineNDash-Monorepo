const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.params;

    const cart = await prisma.cart.findFirst({
      where: { 
        userId,
        restaurantId
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: {
          select: {
            name: true,
            logo: true,
            themeColor: true,
            bgColor: true
          }
        }
      }
    });

    res.json(cart || { items: [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.params;
    const { menuItemId, quantity, specialNote } = req.body;

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { 
        userId,
        restaurantId
      }
    });

    // Create new cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          restaurantId
        }
      });
    }

    // Add item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        quantity,
        specialNote,
        cartId: cart.id,
        menuItemId
      },
      include: {
        menuItem: true
      }
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, restaurantId } = req.params;
    const { quantity, specialNote } = req.body;
    const userId = req.user.id;

    // Verify the item belongs to user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
          restaurantId
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        specialNote
      },
      include: {
        menuItem: true
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId, restaurantId } = req.params;
    const userId = req.user.id;

    // Verify the item belongs to user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
          restaurantId
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.params;
    
    const cart = await prisma.cart.findFirst({
      where: { 
        userId,
        restaurantId
      }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      await prisma.cart.delete({
        where: { id: cart.id }
      });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
}; 