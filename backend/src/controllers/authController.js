import { authenticateUser, createUser } from "../data/store.js";
import { signToken } from "../utils/token.js";
import { sendError } from "../utils/errors.js";

function listFromText(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const user = await createUser({
      name,
      email,
      password,
      allergies: listFromText(req.body.allergies),
      preferences: listFromText(req.body.preferences)
    });
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    sendError(res, error);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ user, token: signToken(user) });
  } catch (error) {
    sendError(res, error);
  }
}
