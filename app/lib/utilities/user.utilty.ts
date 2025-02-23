import crypto from "crypto";

export const generateVerificationToken = function (): string {
  return crypto.randomBytes(4).toString("hex");
  // return crypto.randomBytes(8).toString("hex");
};
