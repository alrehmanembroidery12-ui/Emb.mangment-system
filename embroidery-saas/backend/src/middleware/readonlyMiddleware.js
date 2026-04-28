const readonlyMiddleware = (req, res, next) => {
  // Check if the request is a mutation and if the user is in read-only mode
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (mutationMethods.includes(req.method) && req.user && req.user.is_readonly) {
    // Exception for the demo reset route itself
    if (req.path.includes('/api/demo/reset')) {
        return next();
    }

    return res.status(403).json({
      message: 'This account is in read-only demo mode. You cannot perform this action.'
    });
  }
  
  next();
};

module.exports = readonlyMiddleware;
