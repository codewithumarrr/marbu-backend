// src/utils/roleUtils.js

function hasRole(user, ...roles) {
  return user && roles.includes(user.role_name);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role_name)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { hasRole, requireRole };