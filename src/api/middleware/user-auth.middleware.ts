import jwt from "jsonwebtoken";
import { getDb } from "../utils/db";

interface AuthOptions {
  /**
   * If set to true, a 401(unauthorized) response will not be sent if auth fails.
   * The logged-in status will be saved in the request object
   */
  ignoreAuth?: boolean;
}

/**
 * Adds middleware for user authentication
 * @param options Authentication options
 * @returns A middleware function
 */
export const authenticate = (options?: AuthOptions) => {
  return (req: any, res: any, next: any) => {
    try {
      // Get authorization header and JWT
      const authHeader = req.header("Authorization");
      const bearerToken = authHeader && authHeader.split(" ")[1];

      let loggedIn = true;
      // If no token, ...
      if (!bearerToken) {
        loggedIn = false;
        // ...if ignoreAuth is false, send unauthorized response; otherwise proceed but logged-in status is set to false
        if (!options?.ignoreAuth) {
          return res.status(401).json({ message: "No token" });
        }
      }

      // Verify JWT
      jwt.verify(
        bearerToken,
        process.env.JWT_SECRET ?? "",
        undefined,
        async (err, userData: any) => {
          // If verification error occurs, ...
          if (err) {
            loggedIn = false;
            // ...if ignoreAuth is false, send unauthorized response; otherwise proceed but logged-in status is set to false
            if (!options?.ignoreAuth) {
              return res.status(401).json({ message: "Invalid token", err });
            }
          }

          // Authenticate user based on data from JWT
          var auth = await authenticateUser(userData);

          // If auth fails,
          if (!auth?.valid) {
            loggedIn = false;
            // ...if ignoreAuth is false, send unauthorized response; otherwise proceed but logged-in status is set to false
            if (!options?.ignoreAuth) {
              return res
                .status(auth.err.status || 401)
                .json({ message: auth.err.message });
            }
          }

          const user = auth.user ?? {};

          // Populate request object with user details
          req.user = {
            loggedIn,
            userId: user.Id,
            email: user.Email,
            username: user.Username,
            firstName: user.FirstName,
            lastName: user.LastName,
            fullName: user.FullName,
          };

          // Call next function
          next();
        }
      );
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  };
};

/**
 * Authenticates user
 * @param userData User data
 * @returns User data and validation status
 */
const authenticateUser = async (userData: any): Promise<any> => {
  try {
    // Check if user data is sent
    if (!userData) {
      return { valid: false, err: { message: "No data" } };
    }

    // Initialize db
    const db = await getDb();

    // Check if user exists and if token is valid
    const userExists =
      await db.query`SELECT TOP 1 u.* FROM dbo.Users [u] WHERE u.Id = ${userData.userId} AND u.Token = ${userData.token}`;

    // If not valid, return with invalid
    if (userExists.recordset.length < 1) {
      return { valid: false, err: { message: "Invalid user" } };
    }

    const user = userExists.recordset[0];

    // Return user data
    return { valid: true, user };
  } catch (err: any) {
    return { valid: false, err: { message: err.message, status: 500 } };
  }
};
