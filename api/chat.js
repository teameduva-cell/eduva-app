module.exports = function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: "EDUVA API route is working"
  });
};
