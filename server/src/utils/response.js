export function ok(res, data, message = "Success") {
  return res.status(200).json({ message, data });
}

export function created(res, data, message = "Created") {
  return res.status(201).json({ message, data });
}
