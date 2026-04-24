export function validateReservation(req, res, next) {
  const { spotId, startTime, endTime } = req.body;
  if (!spotId || !startTime || !endTime) {
    return res.status(400).json({ message: "spotId, startTime and endTime are required" });
  }

  next();
}
