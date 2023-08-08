import jwt from "jsonwebtoken";
import { getDb } from "../../utils/db";

/**
 * Generates token for user login
 * @param userId The id of user
 * @param token Token generated for user login
 * @returns Generated jwt token
 */
export const generateJwtToken = (userId: string, token: string) => {
  const user = {
    userId,
    token,
  };

  // Generate jwt token based on user details
  const jwtToken = jwt.sign(user, process.env.JWT_SECRET ?? "", {
    expiresIn: `${process.env.JWT_EXPIRATION_MINUTES || 10080}m`, // Set expiration for token to 7 days
    issuer: process.env.HOST ?? "",
  });

  return jwtToken;
};

/**
 * Gets user credentials. Used to return updated user status after user auth requests
 * @param user User details
 * @param userId The Id of user
 * @returns User credentials to be return to client
 */
export const getUserCredentials = async (user: any, userId?: string) => {
  let userDetails: any = {};
  // If no user detail is sent, fetch details from database using userId
  if (user == null) {
    const db = await getDb();

    const data = (
      await db.query`SELECT TOP 1 u.* FROM dbo.Users [u] WHERE u.Id = ${userId}`
    ).recordset[0];
    if (data.length < 1) {
      return null;
    }

    userDetails = data;
  } else {
    userDetails = user;
  }

  const credentials = {
    userId: userDetails.Id,
    email: userDetails.Email,
    username: userDetails.Username,
    firstName: userDetails.FirstName,
    lastName: userDetails.LastName,
    fullName: userDetails.FullName,
  };

  return credentials;
};
