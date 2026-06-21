export const escapeRegex = (regex: string) =>
  regex.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
