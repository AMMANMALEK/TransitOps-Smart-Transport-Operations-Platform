const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      error: `Duplicate value error: ${field} '${value}' already exists.`
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      error: 'Validation failed',
      details: messages
    });
  }

  // Fallback generic server error
  return res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.'
  });
};

module.exports = errorHandler;
