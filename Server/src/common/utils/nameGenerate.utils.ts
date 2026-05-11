import crypto from "node:crypto"
import path from "node:path";

export const generateFileName = (originalName: string) => {
  const fileExtension = path.extname(originalName);
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${randomBytes}-${Date.now()}${fileExtension}`;
};