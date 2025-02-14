import crypto from "crypto";

export const generateVerificationToken = function (): string {
  return crypto.randomBytes(8).toString("hex");
};
