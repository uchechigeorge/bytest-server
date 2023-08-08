import crypto from "crypto";

/**
 * Hashes password along with salting
 * @param value Password to hash
 * @returns Hashed password
 */
export const hashPassword = (value: string) => {
  const saltedPassword =
    (process.env.PASSWORD_START_SALT ?? "") +
    value +
    (process.env.PASSWORD_END_SALT ?? "");
  const hashedPassword = crypto
    .createHash("sha512")
    .update(saltedPassword)
    .digest("hex");

  return hashedPassword;
};
