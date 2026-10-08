const errorHandler = (err, req, res, next) => {
  console.log(err);

  res.status(err.statusCode || 500).json({
    message: err.statusCode ? err.message : "Something went wrong",
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;