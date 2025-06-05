const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Sample Restaurant",
      description: "A cozy restaurant with delicious food",
      themeColor: "#215719",
      bgColor: "#FBF4E3",
      menuItems: {
        create: [
          {
            name: "Margherita Pizza",
            description: "Classic pizza with tomato sauce, mozzarella, and basil",
            price: 120.00,
            category: "Pizza",
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60"
          },
          {
            name: "Caesar Salad",
            description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
            price: 85.00,
            category: "Salads",
            image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=60"
          },
          {
            name: "Chocolate Cake",
            description: "Rich chocolate cake with ganache frosting",
            price: 65.00,
            category: "Desserts",
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60"
          },
          {
            name: "Pasta Carbonara",
            description: "Creamy pasta with bacon and parmesan",
            price: 95.00,
            category: "Main Course",
            image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=60"
          },
          {
            name: "Fresh Lemonade",
            description: "Refreshing homemade lemonade with mint leaves",
            price: 25.00,
            category: "Beverages"
          }
        ]
      }
    }
  });

  console.log('Created restaurant with ID:', restaurant.id);
  console.log('Created menu items for the restaurant');

  // Check if the table already exists
  const existingTable = await prisma.table.findFirst({
    where: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    }
  });

  if (!existingTable) {
    // Create a table with our specified ID
    await prisma.table.create({
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        tableNumber: 1,
        qrCode: 'https://dinendashtable1.com/qr',
        restaurantId: 'e740fa98-8926-4b5b-81f3-13e5090dedac' // This is the restaurant ID we're using
      }
    });
    
    console.log('Table created successfully');
  } else {
    console.log('Table already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
