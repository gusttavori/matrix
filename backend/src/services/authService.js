const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      institutionId: user.institutionId,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken
};
