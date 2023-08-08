import { Request, Response } from "express";
import { CommentStatus } from "../../../models/Comment";
import commentsService from "../../../services/comments";
import postsService from "../../../services/posts";
import { getDb } from "../../../utils/db";
import { getUserDefaultDp } from "../../../utils/file-helper";
import { isNullOrWhitespace } from "../../../utils/type-helpers";

/**
 * API controller to fetch comments from resource
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const getComments = async (req: Request, res: Response) => {
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
    const postId = query("postid");
    const status = query("status");
    const parentId = query("parentid");
    const userId = query("userid");

    const user = req["user"];

    // By default, only approved comments are returned
    let useStatusParam = false;

    // If the user making request is logged in, and is making a request for the comment created by self
    if (!isNullOrWhitespace(userId) && user?.userId == userId) {
      // ...then use status param
      useStatusParam = true;
    }

    // If the user making request is logged in, and is making a request for the comments for a post created by self
    if (!isNullOrWhitespace(postId)) {
      const db = await getDb();
      const isPostOwner =
        (
          await db.query`SELECT TOP 1 * FROM dbo.Posts [p] INNER JOIN dbo.Users [u] ON u.Id = p.UserId WHERE u.Id = ${user.userId}`
        ).recordset.length > 0;

      // ...then use status param
      if (isPostOwner) {
        useStatusParam = isPostOwner;
      }
    }

    const statusFilter = useStatusParam ? status : "1";

    const result = await commentsService.getComments(
      {
        page,
        perPage,
        sort,
        order,
        searchStrings,
        searchOperators,
        searchColumns,
        searchStack,
        postId,
        parentId,
        status: statusFilter,
        userId,
      },
      { ownerId: user.userId, postOwnerId: user.userId }
    );

    await (async () => {
      for (const comment of result.data) {
        if (comment.Anonymous) {
          comment.UserId = null;
          comment.UserId2 = null;
          comment.UserFullName = "Anonymous User";
          comment.UserEmail = "***";
          comment.UserDpUrl = null;
        }
      }
    })();

    const data = result.data.map((d) => new GetCommentResponse(d));

    res.status(200).json({
      message: "OK",
      data,
      meta: {
        total: result.total,
        statusFilter,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * API controller to get single comment from resource
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const getComment = async (req: Request, res: Response) => {
  try {
    // Get comment id from params
    const commentId = req.params.id;

    // Initialize db
    const db = await getDb();

    // Check if comment exists
    const exists = (
      await db.query`SELECT TOP 1 * FROM dbo.Comments [p] WHERE c.Id = ${commentId}`
    ).recordset;

    // Send 404 response if not found
    if (exists.length < 1) {
      return res.status(404).json({ message: "Record not found" });
    }

    const result = await commentsService.getComments({
      commentId,
    });

    // if (result.data[0].Hidden && !result.data[0].IsOwner) {
    //   return res.status(400).json({ message: "Cannot view post" });
    // }

    const data = new GetCommentResponse(result.data[0]);

    res.status(200).json({
      message: "OK",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class GetCommentResponse {
  constructor(data: any) {
    this.id = data.Id;
    this.content = data.Content;
    this.parentId = data.ParentId;
    this.postId = data.PostId;
    this.post = {
      id: data.PostId2,
      title: data.PostTitle,
      userId: data.PostUserId,
    };
    this.userId = data.UserId;
    this.user = {
      id: data.UserId2,
      name: data.UserFullName,
      email: data.UserEmail,
      dpUrl: getUserDefaultDp(data.UserDpUrl),
    };
    this.edited = data.Edited;
    this.anonymous = data.Anonymous;
    this.statusId = data.StatusId;
    this.status = CommentStatus[data.StatusId];
    this.hasReply = data.NoOfReplies > 0;
    this.noOfReplies = data.NoOfReplies;
    this.isOwner = data.IsOwner;
    this.isPostOwner = data.IsPostOwner;
    this.dateCreated = data.DateCreated;
    this.dateModified = data.DateModified;
  }

  id: number;
  content?: string;
  parentId?: string;
  postId?: string;
  post?: any;
  userId?: string;
  user?: any;
  statusId: number;
  status: string;
  edited: boolean;
  anonymous: boolean;
  hasReply: boolean;
  isOwner: boolean;
  isPostOwner: boolean;
  noOfReplies: number;
  dateModified: Date;
  dateCreated: Date;
}
