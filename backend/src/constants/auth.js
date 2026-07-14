export const USER_ROLES = Object.freeze({
  USER: "user",
  RESTAURANT_OWNER: "restaurant_owner",
  ADMIN: "admin"
});

export const USER_STATUSES = Object.freeze({
  ACTIVE: "active",
  PENDING: "pending",
  BLOCKED: "blocked"
});

export const PUBLIC_REGISTRATION_ROLES = Object.freeze([USER_ROLES.USER, USER_ROLES.RESTAURANT_OWNER]);
