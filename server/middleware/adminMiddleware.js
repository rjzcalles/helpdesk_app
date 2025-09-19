const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin_inf' || req.user.role === 'admin_ing')) {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado.' });
};

module.exports = admin;