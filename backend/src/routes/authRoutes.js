const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware'); // Validation middleware

// Route to register a new user
router.post('/register', validateRegister, register);

// Route to log in an existing user
router.post('/login', validateLogin, login);

// Route to get the current user's details (requires authentication)
router.get('/me', authMiddleware, getMe);

module.exports = router;