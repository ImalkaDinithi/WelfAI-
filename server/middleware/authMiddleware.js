const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const { JWT_SECRET } = require('../utils/generateToken');

// Protect routes - verifies JWT and attaches a lightweight auth payload to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId || decoded.id);

      if (!user) {
        res.status(401);
        throw new Error('User not found, authorization denied');
      }

      req.user = {
        userId: user._id.toString(),
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      };

      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed or expired');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Restrict access to specific roles, e.g. authorize('admin').
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. Role '${req.user ? req.user.role : 'unknown'}' is not permitted to access this resource`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
