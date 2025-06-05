const { PrismaClient } = require('@prisma/client');
const { emitPaymentUpdate } = require('../services/socketService');
const prisma = new PrismaClient();

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, tableId, items } = req.body;
    const userId = req.user.id; // Will be set by auth middleware

    // Calculate total from items
    const total = await calculateOrderTotal(items);

    // Create order with items
    const order = await prisma.order.create({
      data: {
        total,
        userId,
        restaurantId,
        tableId,
        items: {
          create: items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            specialNote: item.specialNote,
            menuItemId: item.menuItemId
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Create order from cart
exports.createOrderFromCart = async (req, res) => {
  try {
    const { restaurantId, tableId } = req.body;
    const userId = req.user.id; // Will be set by auth middleware

    // Get the user's cart
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
        }
      }
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare items for order
    const orderItems = cart.items.map(item => ({
      quantity: item.quantity,
      price: item.menuItem.price,
      specialNote: item.specialNote,
      menuItemId: item.menuItem.id
    }));

    // Calculate total
    const total = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        total,
        userId,
        restaurantId,
        tableId,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        table: true
      }
    });

    // Clear the cart after order is created
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation from cart error:', error);
    res.status(500).json({ message: 'Error creating order from cart' });
  }
};

// Add more items to an existing order
exports.addToExistingOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;
    const userId = req.user.id;

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or cannot be modified' });
    }

    // Fetch all existing order items and menu items in batch
    const menuItemIds = items.map(item => item.menuItemId);
    const [existingItems, menuItems] = await Promise.all([
      prisma.orderItem.findMany({
        where: { orderId, menuItemId: { in: menuItemIds } },
        select: { id: true, menuItemId: true, quantity: true, specialNote: true }
      }),
      prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        select: { id: true, price: true }
      })
    ]);
    const existingMap = new Map(existingItems.map(ei => [ei.menuItemId, ei]));
    const priceMap = new Map(menuItems.map(mi => [mi.id, mi.price]));

    const addedItems = [];
    for (const item of items) {
      const existingItem = existingMap.get(item.menuItemId);
      if (existingItem) {
        // Update existing item quantity
        const updatedItem = await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: existingItem.quantity + item.quantity,
            specialNote: item.specialNote || existingItem.specialNote
          },
          include: { menuItem: true }
        });
        addedItems.push(updatedItem);
      } else {
        // Add new item
        const price = priceMap.get(item.menuItemId) || 0;
        const newItem = await prisma.orderItem.create({
          data: {
            quantity: item.quantity,
            price,
            specialNote: item.specialNote,
            orderId,
            menuItemId: item.menuItemId
          },
          include: { menuItem: true }
        });
        addedItems.push(newItem);
      }
    }

    // Recalculate total
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { menuItem: true } }
      }
    });
    const newTotal = updatedOrder.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );

    // Update order total
    const finalOrder = await prisma.order.update({
      where: { id: orderId },
      data: { total: newTotal },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        table: true
      }
    });

    res.json(finalOrder);
  } catch (error) {
    console.error('Error adding to order:', error);
    res.status(500).json({ message: 'Error adding to order' });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: {
          select: {
            name: true,
            logo: true
          }
        },
        table: {
          select: {
            tableNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get a specific order
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        table: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
};

// Update order item special note
exports.updateOrderItemNote = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { specialNote } = req.body;

    const orderItem = await prisma.orderItem.update({
      where: {
        id: itemId,
        orderId // Ensure the item belongs to the specified order
      },
      data: { specialNote },
      include: {
        menuItem: true
      }
    });

    res.json(orderItem);
  } catch (error) {
    console.error('Error updating order item note:', error);
    res.status(500).json({ message: 'Error updating special note' });
  }
};

// Get all orders for a specific table
exports.getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.user.id;

    // Get the table and restaurant info
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true }
    });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Find or create a table session
    let tableSession = await prisma.tableSession.findFirst({
      where: {
        tableId,
        isActive: true,
        isPaid: false
      }
    });

    if (!tableSession) {
      // Create a new table session if none exists
      tableSession = await prisma.tableSession.create({
        data: {
          tableId,
          restaurantId: table.restaurantId,
          isActive: true,
          isPaid: false
        }
      });
    }

    // Find all orders for this table session
    const orders = await prisma.order.findMany({
      where: {
        tableId,
        tableSessionId: tableSession.id
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate table totals
    const subtotal = orders.reduce((sum, order) => sum + order.total, 0);
    const taxRate = table.restaurant.taxRate || 0.14; // Default to 14% if not set
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Update table session with calculated amounts
    await prisma.tableSession.update({
      where: { id: tableSession.id },
      data: {
        totalAmount: total,
        taxAmount
      }
    });

    // Get user's own orders
    const userOrders = orders.filter(order => order.userId === userId);
    const userSubtotal = userOrders.reduce((sum, order) => sum + order.total, 0);
    const userTaxAmount = userSubtotal * taxRate;
    const userTotal = userSubtotal + userTaxAmount;

    // Calculate split recommendations
    const userCount = new Set(orders.map(order => order.userId)).size;
    const evenSplit = total / userCount;

    // Prepare response
    const response = {
      tableSession: {
        ...tableSession,
        restaurant: table.restaurant,
        table
      },
      allOrders: orders,
      tableTotals: {
        subtotal,
        taxAmount,
        total,
        taxRate
      },
      userTotals: {
        subtotal: userSubtotal,
        taxAmount: userTaxAmount,
        total: userTotal
      },
      splitOptions: {
        byOrder: userTotal,
        evenly: evenSplit,
        payAll: total
      },
      userCount
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting table orders:', error);
    res.status(500).json({ message: 'Error getting table orders' });
  }
};

// Calculate split for an order
exports.calculateOrderSplit = async (req, res) => {
  const startTime = Date.now(); // Performance tracking
  try {
    const { orderId } = req.params;
    const { method } = req.body;
    const userId = req.user.id;

    // Verify the order exists - use select to only get fields we need
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        tableId: true,
        restaurantId: true,
        tableSessionId: true,
        table: {
          select: {
            id: true,
          }
        },
        restaurant: {
          select: {
            id: true, 
            taxRate: true
          }
        },
        tableSession: {
          select: {
            id: true,
            isActive: true,
            isPaid: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get all orders for this table session
    let tableSession = order.tableSession;
    
    if (!tableSession) {
      // Find or create a table session if one doesn't exist
      tableSession = await prisma.tableSession.findFirst({
        where: {
          tableId: order.tableId,
          isActive: true,
          isPaid: false
        },
        select: {
          id: true,
          isActive: true,
          isPaid: true
        }
      });

      if (!tableSession) {
        tableSession = await prisma.tableSession.create({
          data: {
            tableId: order.tableId,
            restaurantId: order.restaurantId,
            isActive: true,
            isPaid: false
          }
        });
      }

      // Update order with table session - this can be optimized out for speed
      // Only update if strictly necessary
      await prisma.order.update({
        where: { id: orderId },
        data: {
          tableSessionId: tableSession.id
        }
      });
    }

    // Get all orders with a single query - optimize by only selecting needed fields
    const allOrders = await prisma.order.findMany({
      where: {
        tableSessionId: tableSession.id
      },
      select: {
        id: true,
        total: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate table totals - use more efficient calculation
    const subtotal = allOrders.reduce((sum, o) => sum + o.total, 0);
    const taxRate = order.restaurant.taxRate || 0.14;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Calculate amount to pay based on split method
    let amountToPay = 0;
    let splitDescription = '';
    const userOrders = allOrders.filter(o => o.userId === userId);
    const userSubtotal = userOrders.reduce((sum, o) => sum + o.total, 0);
    const userTaxAmount = userSubtotal * taxRate;
    const userTotal = userSubtotal + userTaxAmount;
    const uniqueUserIds = new Set();
    allOrders.forEach(o => uniqueUserIds.add(o.userId));
    const userCount = uniqueUserIds.size;

    switch (method) {
      case 'BY_ORDER':
        amountToPay = userTotal;
        splitDescription = 'Paying for your orders only';
        break;
      case 'EVENLY':
        amountToPay = total / userCount;
        splitDescription = `Split evenly between ${userCount} diners`;
        break;
      case 'PAY_ALL':
        amountToPay = total;
        splitDescription = 'Paying for the entire table';
        break;
      default:
        return res.status(400).json({ message: 'Invalid split method' });
    }

    // Update order with split method - consider batching database updates
    await prisma.order.update({
      where: { id: orderId },
      data: {
        splitMethod: method,
        taxAmount: method === 'PAY_ALL' ? taxAmount : (method === 'EVENLY' ? taxAmount / userCount : userTaxAmount)
      }
    });

    // Prepare response with split details
    const response = {
      splitMethod: method,
      amountToPay,
      splitDescription,
      tableTotal: total,
      userTotal,
      taxAmount: method === 'PAY_ALL' ? taxAmount : (method === 'EVENLY' ? taxAmount / userCount : userTaxAmount),
      taxRate,
      userCount,
      order: {
        ...order,
        tableSession
      },
      allOrders,
      tableTotals: {
        subtotal,
        taxAmount,
        total,
        taxRate
      },
      calculationTime: Date.now() - startTime // Add calculation time to help track performance
    };

    // Update table session in background without waiting for it to complete
    prisma.tableSession.update({
      where: { id: tableSession.id },
      data: {
        totalAmount: total,
        taxAmount
      }
    }).catch(error => {
      console.error('Background table session update failed:', error);
    });

    res.json(response);
  } catch (error) {
    console.error(`Error calculating split (took ${Date.now() - startTime}ms):`, error);
    res.status(500).json({ message: 'Error calculating split' });
  }
};

// Set payment method for an order
exports.setPaymentMethod = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, splitMethod } = req.body;
    const userId = req.user.id;

    // Verify the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: true,
        table: true,
        restaurant: true,
        tableSession: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If split method is provided, calculate amount based on split
    let amountToPay = order.total;
    
    if (splitMethod) {
      const tableSession = order.tableSession;
      
      if (!tableSession) {
        return res.status(400).json({ message: 'No active table session found' });
      }
      
      const allOrders = await prisma.order.findMany({
        where: {
          tableSessionId: tableSession.id
        }
      });
      
      const tableTotal = allOrders.reduce((sum, o) => sum + o.total, 0);
      const taxRate = order.restaurant.taxRate || 0.14;
      const taxAmount = tableTotal * taxRate;
      const total = tableTotal + taxAmount;
      const userOrders = allOrders.filter(o => o.userId === userId);
      const userSubtotal = userOrders.reduce((sum, o) => sum + o.total, 0);
      const userTaxAmount = userSubtotal * taxRate;
      const userTotal = userSubtotal + userTaxAmount;
      const userCount = new Set(allOrders.map(o => o.userId)).size;
      
      switch (splitMethod) {
        case 'BY_ORDER':
          amountToPay = userTotal;
          break;
        case 'EVENLY':
          amountToPay = total / userCount;
          break;
        case 'PAY_ALL':
          amountToPay = total;
          break;
      }
      
      // Update order with split method
      await prisma.order.update({
        where: { id: orderId },
        data: {
          splitMethod,
          taxAmount: splitMethod === 'PAY_ALL' ? taxAmount : (splitMethod === 'EVENLY' ? taxAmount / userCount : userTaxAmount)
        }
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: amountToPay,
        method,
        userId,
        orderId,
        tableSessionId: order.tableSessionId,
        status: method === 'CASH' ? 'WAITING_CASH_CONFIRMATION' : 'PAYMENT_PENDING'
      }
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: method === 'CASH' ? 'WAITING_CASH_CONFIRMATION' : 'PAYMENT_PENDING'
      }
    });

    // If paying for all, update table session
    if (splitMethod === 'PAY_ALL') {
      await prisma.tableSession.update({
        where: { id: order.tableSessionId },
        data: {
          isPaid: true
        }
      });
    }

    // Emit payment update event
    if (order.tableId) {
      emitPaymentUpdate(order.tableId, {
        orderId,
        status: method === 'CASH' ? 'WAITING_CASH_CONFIRMATION' : 'PAYMENT_PENDING',
        amount: amountToPay,
        method,
        updatedAt: payment.updatedAt
      });
    }

    res.json({
      message: method === 'CASH' 
        ? 'Cash payment pending waiter confirmation' 
        : 'Card payment initialized',
      payment,
      amountToPay
    });
  } catch (error) {
    console.error('Error setting payment method:', error);
    res.status(500).json({ message: 'Error setting payment method' });
  }
};

// Confirm cash payment (admin/waiter endpoint)
exports.confirmCashPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { isConfirmed } = req.body;

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        tableSession: true
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'WAITING_CASH_CONFIRMATION') {
      return res.status(400).json({ message: 'Payment is not awaiting cash confirmation' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: isConfirmed ? 'PAID' : 'FAILED'
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: isConfirmed ? 'PAID' : 'UNPAID'
      }
    });

    // Check if this was a "pay all" payment
    if (isConfirmed && payment.tableSession && payment.order.splitMethod === 'PAY_ALL') {
      // Mark all orders in the session as paid
      await prisma.order.updateMany({
        where: {
          tableSessionId: payment.tableSession.id
        },
        data: {
          paymentStatus: 'PAID'
        }
      });

      // Mark table session as paid
      await prisma.tableSession.update({
        where: { id: payment.tableSession.id },
        data: {
          isPaid: true
        }
      });
    }

    // Emit payment update event
    if (payment.tableId) {
      emitPaymentUpdate(payment.tableId, {
        orderId: payment.orderId,
        status: isConfirmed ? 'PAID' : 'UNPAID',
        amount: payment.amount,
        method: payment.method,
        updatedAt: updatedPayment.updatedAt
      });
    }

    res.json({
      message: isConfirmed ? 'Cash payment confirmed' : 'Cash payment rejected',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error confirming cash payment:', error);
    res.status(500).json({ message: 'Error confirming cash payment' });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the order and its payment
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      paymentStatus: order.paymentStatus,
      payment: order.payment
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ message: 'Error getting payment status' });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        table: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { orderId },
      data: { status }
    });

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status },
      include: {
        payment: true,
        table: true
      }
    });

    // Emit payment update event
    if (order.tableId) {
      emitPaymentUpdate(order.tableId, {
        orderId,
        status,
        amount: updatedPayment.amount,
        method: updatedPayment.method,
        updatedAt: updatedPayment.updatedAt
      });
    }

    res.json({
      message: 'Payment status updated successfully',
      payment: updatedPayment,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  const { orderId } = req.params;
  const { method, splitMethod } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        table: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create or update payment
    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: {
        method,
        status: method === 'CASH' ? 'WAITING_CASH_CONFIRMATION' : 'PAYMENT_PENDING',
        amount: order.total
      },
      create: {
        orderId,
        userId: req.user.id,
        method,
        status: method === 'CASH' ? 'WAITING_CASH_CONFIRMATION' : 'PAYMENT_PENDING',
        amount: order.total
      }
    });

    // Update order with payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: payment.status,
        splitMethod
      },
      include: {
        payment: true,
        table: true
      }
    });

    // Emit payment update event
    if (order.tableId) {
      emitPaymentUpdate(order.tableId, {
        orderId,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        updatedAt: payment.updatedAt
      });
    }

    res.json({
      message: 'Payment processed successfully',
      payment,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

// Optimized calculateOrderTotal
async function calculateOrderTotal(items) {
  const menuItemIds = items.map(item => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, price: true }
  });
  const priceMap = new Map(menuItems.map(mi => [mi.id, mi.price]));
  let total = 0;
  for (const item of items) {
    const price = priceMap.get(item.menuItemId) || 0;
    total += price * item.quantity;
  }
  return total;
} 