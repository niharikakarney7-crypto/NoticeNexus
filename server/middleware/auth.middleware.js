/**
 * NoticeNexus — Authentication & Role-Based Authorization Middleware
 * Verifies JWT tokens and enforces role restrictions (student, staff, admin).
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifies JWT token in Authorization header
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please provide a valid Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'noticenexus_fallback_secret');
    req.user = decoded; // Contains id, username, email, role, department_id
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your session token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token.'
    });
  }
}

/**
 * Middleware Factory: Enforces Role-Based Access Control
 * e.g., requireRoles('staff', 'admin')
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRoles
};
