// src/utils/roleUtils.js

function hasRole(user, ...roles) {
  return user && user.roles && roles.includes(user.roles.role_name);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !roles.includes(req.user.roles.role_name)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { hasRole, requireRole };