const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'welfai-dev-secret';

// Generates a signed JWT containing the user's id and role.
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
module.exports.JWT_SECRET = JWT_SECRET;
