import { Request, Response } from "express";
import postsService from "../../../services/posts";
import userService from "../../../services/users";
import { getDb } from "../../../utils/db";

/**
 * API controller to fetch users from resource
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const query = req["getQuery"];

    const page = parseInt(query("page") ?? 1);
    const perPage = parseInt(query("perPage") ?? 50);
    const sort = query("sort");
    const order = query("order");
    const searchStrings =
      query("search")
        ?.toString()
        ?.split(",")
        ?.map((opt: string) => opt?.trim()) ?? [];
    const searchColumns =
      query("searchcolumn")
        ?.toString()
        ?.split(",")
        ?.map((opt: string) => opt?.trim()) ?? [];
    const searchOperators =
      query("searchoperator")
        ?.toString()
        ?.split(",")
        ?.map((opt: string) => opt?.trim()) ?? [];
    const searchStack =
      query("searchstack")
        ?.toString()
        ?.split(",")
        ?.map((opt: string) => opt?.trim()) ?? [];

    const result = await userService.getUsers({
      page,
      perPage,
      sort,
      order,
      searchStrings,
      searchOperators,
      searchColumns,
      searchStack,
    });

    const data = result.data.map((d) => new GetUserResponse(d));

    res.status(200).json({
      message: "OK",
      data,
      meta: {
        total: result.total,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * API controller to get single user from resource
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const db = await getDb();

    const exists = (
      await db.query`SELECT TOP 1 * FROM dbo.Users [u] WHERE u.Id = ${userId}`
    ).recordset;

    if (exists.length < 1) {
      return res.status(404).json({ message: "Record not found" });
    }

    const result = await userService.getUsers({
      userId,
    });

    const data = new GetUserResponse(result.data[0]);

    res.status(200).json({
      message: "OK",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class GetUserResponse {
  constructor(data: any) {
    this.id = data.Id;
    this.firstName = data.FirstName;
    this.lastName = data.LastName;
    this.fullName = data.FullName;
    this.email = data.Email;
    this.password = data.Password;
    this.username = data.Username;
    this.dateCreated = data.DateCreated;
    this.dateModified = data.DateModified;
  }

  id: number;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  dateModified: Date;
  dateCreated: Date;
}
