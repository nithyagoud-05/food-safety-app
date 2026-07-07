export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function mapError(error) {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return { statusCode: 400, message: "Invalid request" };
  }

  if (error?.code === 11000) {
    return { statusCode: 400, message: "Duplicate record" };
  }

  return { statusCode: 500, message: "Internal server error" };
}

export function sendError(res, error) {
  const { statusCode, message } = mapError(error);
  res.status(statusCode).json({ message });
}
