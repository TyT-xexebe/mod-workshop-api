export const ROLES = ["user", "moderator", "admin"] as const;
export type UserRole = (typeof ROLES)[number];

export const MOD_TAGS = [
  "content",
  "script",
  "UI",
  "qol",
  "java",
  "soundpack",
  "texturepack",
] as const;
export type ModTag = (typeof MOD_TAGS)[number];

export const FILE_UPLOAD = {
  EXTENSIONS: [".jar", ".zip", ".js"] as const,
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
} as const;
