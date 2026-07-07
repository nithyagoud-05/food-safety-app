import { updateUserProfile } from "../data/store.js";
import { sendError } from "../utils/errors.js";

function listFromText(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getProfile(req, res) {
  res.json(req.user);
}

export async function updateProfile(req, res) {
  try {
    const user = await updateUserProfile(req.user.id, {
      allergies: listFromText(req.body.allergies),
      preferences: listFromText(req.body.preferences)
    });
    res.json(user);
  } catch (error) {
    sendError(res, error);
  }
}
