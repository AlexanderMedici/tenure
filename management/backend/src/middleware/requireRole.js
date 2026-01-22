const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(httpError(401, "Not authenticated"));
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, "Insufficient role"));
    }
    return next();
  };
