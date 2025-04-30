const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const menuRoutes = require('./routes/menuRoutes'); // Import menu routes
const restaurantRoutes = require('./routes/restaurantRoutes');
const cors = require('cors'); // Optional: Enable CORS if needed

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Optional: Enable CORS for cross-origin requests
app.use(cors());

// Routes
app.use('/api/auth', authRoutes); // Prefix all auth routes with /api/auth
app.use('/api', menuRoutes); // Add menu routes under /api
app.use('/api', restaurantRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export the app for testing