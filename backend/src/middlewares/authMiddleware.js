const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from the header

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = { id: decoded.userId, name: decoded.name };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle invalid or expired tokens
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};