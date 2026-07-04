import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "annapurna-local-secret";

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
