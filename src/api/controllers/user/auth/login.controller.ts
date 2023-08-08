import { Request, Response } from "express";
import { getDb } from "../../../utils/db";
import { isNullOrWhitespace } from "../../../utils/type-helpers";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import userService from "../../../services/users";
import { hashPassword } from "../../../utils/crypto-helpers";

/**
 * API controller for user login
 */
export const login = async (req: Request, res: Response) => {
  try {
    var body = new LoginBody(req.body);

    // Check if email and password are available
    if (isNullOrWhitespace(body.email) || isNullOrWhitespace(body.password)) {
      return res.status(400).json({ message: "Bad request" });
    }

    const db = await getDb();

    // Check if user credentials are valid; using either of email or username
    var userCheck =
      await db.query`SELECT TOP 1 * FROM dbo.Users u WHERE ([u].[Email] = ${
        body.email
      } OR [u].[Username] = ${body.email}) AND [u].[Password] = ${hashPassword(
        body.password
      )}`;
    if (userCheck.recordset.length < 1) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userDetails = userCheck.recordset[0];

    const userToken = crypto.randomBytes(32).toString("hex");

    // Update user token
    await db.query`UPDATE dbo.Users SET [Token] = ${userToken} WHERE [Id] = ${userDetails.Id}`;

    const user = {
      userId: userDetails.Id,
      token: userToken,
    };

    // Generate new jwt token
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET ?? "", {
      expiresIn: `${process.env.JWT_EXPIRATION_MINUTES || 10080}m`, // Set expiration for token to 7 days
      issuer: process.env.HOST ?? "",
    });

    res.status(200).json({
      message: "Ok",
      data: {
        token: jwtToken,
        credentials: await userService.getUserCredentials(
          userCheck.recordset[0]
        ),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

class LoginBody {
  constructor(data: any) {
    this.email = data.email;
    this.password = data.password;
  }

  email: string;
  password: string;
}
