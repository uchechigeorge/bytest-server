import { Request, Response } from "express";
import { getDb } from "../../../utils/db";
import { isNullOrWhitespace } from "../../../utils/type-helpers";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import userService from "../../../services/users";
import { hashPassword } from "../../../utils/crypto-helpers";

/**
 * API controller for user sign up
 */
export const signUp = async (req: Request, res: Response) => {
  try {
    var body = new SignupBody(req.body);

    // Check if email and password are available
    if (isNullOrWhitespace(body.email) || isNullOrWhitespace(body.password)) {
      return res.status(400).json({ message: "Bad request" });
    }

    // Initialize db
    const db = await getDb();

    // Check if there is an existing email/username
    var duplicateCheck =
      await db.query`SELECT TOP 1 * FROM dbo.Users u WHERE [u].[Email] = ${body.email} OR [u].[Username] = ${body.username}`;
    if (duplicateCheck.recordset.length > 0) {
      return res.status(400).json({ message: "Duplicate email/username" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Insert new user to db
    const insertedUserResult = await userService.addUser({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      password: hashPassword(body.password),
      username: body.username,
      token: token,
    });

    const insertedUser = insertedUserResult.recordset[0];

    const user = {
      userId: insertedUser.Id,
      token: token,
    };

    // Generate jwt token based on user details
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET ?? "", {
      expiresIn: `${process.env.JWT_EXPIRATION_MINUTES || 10080}m`, // Set expiration for token to 7 days
      issuer: process.env.HOST ?? "",
    });

    res.status(200).json({
      message: "Ok",
      data: {
        token: jwtToken,
        credentials: await userService.getUserCredentials(
          null,
          insertedUser.Id
        ),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

class SignupBody {
  constructor(data: any) {
    this.email = data.email;
    this.password = data.password;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }

  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}
