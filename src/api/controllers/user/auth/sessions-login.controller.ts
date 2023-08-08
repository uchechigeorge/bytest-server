import { Request, Response } from "express";
import userService from "../../../services/users";

/**
 * API controller to check logged in status of user
 *
 */
export const sessionsLogin = async (req: Request, res: Response) => {
  try {
    const data = req["user"];

    res.status(200).json({
      message: "OK",
      data: {
        credentials: await userService.getUserCredentials(null, data.userId),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
