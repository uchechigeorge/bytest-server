import { Request, Response } from "express";
import postsService from "../../../services/posts";
import { getDb } from "../../../utils/db";
import { getPostDefaultImage } from "../../../utils/file-helper";

/**
 * API controller to fetch posts from resource
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const getPosts = async (req: Request, res: Response) => {
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
    const userId = query("userid");
    const hidden = query("hidden");

    const user = req["user"];
    const isOwner = user?.userId == userId;

    const result = await postsService.getPosts({
      page,
      perPage,
      sort,
      order,
      searchStrings,
      searchOperators,
      searchColumns,
      searchStack,
      userId,
      // If is owner, use hidden filter sent via params, otherwise set to false
      hidden: isOwner ? hidden : "0",
    });

    const data = result.data.map((d) => new GetPostResponse(d));

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
 * API controller to get single post from resource
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req["user"]?.userId;

    const db = await getDb();

    const exists = (
      await db.query`SELECT TOP 1 * FROM dbo.Posts [p] WHERE p.Id = ${postId}`
    ).recordset;

    if (exists.length < 1) {
      return res.status(404).json({ message: "Record not found" });
    }

    const result = await postsService.getPosts(
      {
        postId,
      },
      { ownerId: userId }
    );

    if (result.data[0]?.Hidden && !result.data[0]?.IsOwner) {
      return res.status(400).json({ message: "Cannot view post" });
    }

    const data = new GetPostResponse(result.data[0]);

    res.status(200).json({
      message: "OK",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class GetPostResponse {
  constructor(data: any) {
    this.id = data.Id;
    this.title = data.Title;
    this.content = data.Content;
    this.userId = data.UserId;
    this.user = {
      id: data.UserId2,
      name: data.UserFullName,
      email: data.UserEmail,
    };
    this.hidden = data.Hidden;
    this.imageUrl = getPostDefaultImage(data.ImageUrl);
    this.noOfComments = data.NoOfComments;
    this.isOwner = data.IsOwner;
    this.dateCreated = data.DateCreated;
    this.dateModified = data.DateModified;
  }

  id: number;
  title?: string;
  content?: string;
  userId?: string;
  user?: any;
  hidden?: boolean;
  noOfComments?: number;
  imageUrl?: string;
  isOwner: boolean;
  dateModified: Date;
  dateCreated: Date;
}
