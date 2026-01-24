exports.successRes = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

exports.errorRes = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
