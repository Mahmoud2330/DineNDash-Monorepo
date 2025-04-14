const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

exports.login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body);
    res.status(200).json({ token });
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json(req.user); // Return the authenticated user's details
};