/**
 * NoticeNexus — Authentication Controller
 * Handles login, current user verification, and logout endpoints.
 */

const authService = require('../services/auth.service');

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username/Email and password are required.'
      });
    }

    const { token, user } = await authService.authenticateUser(username, password);

    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieves authenticated user details from token
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          departmentId: user.department_id,
          departmentName: user.department_name,
          academicYear: user.academic_year
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
}

module.exports = {
  login,
  getMe,
  logout
};
