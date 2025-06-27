// src/utils/roleUtils.js

function hasRole(user, ...roles) {
  return user && user.role && roles.includes(user.role);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { hasRole, requireRole };
