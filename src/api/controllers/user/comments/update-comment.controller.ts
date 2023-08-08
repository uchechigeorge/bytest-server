import { Request, Response } from "express";
import { CommentStatus } from "../../../models/Comment";
import commentsService from "../../../services/comments";
import { getDb } from "../../../utils/db";
import { isNullOrWhitespace } from "../../../utils/type-helpers";

/**
 * API controller to update existing comment record on database
 * This action can be taken by the creator of the comment only
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const editComment = async (req: Request, res: Response) => {
  try {
    // Get id of comment from params
    const commentId = req.params.id;
    // Get user details from Express Request object
    const user = req["user"];
    // Get body
    const body = new UpdateCommentBody(req.body);

    // Check if content is available
    if (isNullOrWhitespace(body.content)) {
      return res.status(400).json({ message: "Bad request" });
    }

    // Initialize db
    const db = await getDb();

    // Check if comment exists
    const commentCheck = (
      await db.query`SELECT TOP 1 c.* FROM dbo.Comments [c] WHERE c.Id = ${commentId} AND c.UserId = ${user.userId}`
    ).recordset;
    if (commentCheck.length < 1) {
      return res.status(400).json({ message: "Invalid comment" });
    }

    // Update comment
    await commentsService.editComment(commentId, {
      content: body.content,
    });

    res.status(200).json({ message: "Comment updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class UpdateCommentBody {
  constructor(data: any) {
    this.content = data.content;
  }

  content: string;
}

/**
 * API controller to update status of existing comment from db
 * This action can be taken by the owner of the post only
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const updateCommentStatus = async (req: Request, res: Response) => {
  try {
    // Get id of comment from params
    const commentId = req.params.id;
    // Get user details from Request object
    const user = req["user"];
    // Get body
    const body = new HideCommentBody(req.body);

    // Initialize db
    const db = await getDb();

    // Check if comment exists
    const commentCheck = (
      await db.query`SELECT TOP 1 c.* FROM dbo.Comments [c] 
        INNER JOIN dbo.Posts [p] ON p.Id = c.PostId
        INNER JOIN dbo.Users [u] ON u.Id = p.UserId
      WHERE c.Id = ${commentId} AND u.Id = ${user.userId}`
    ).recordset;
    if (commentCheck.length < 1) {
      return res.status(400).json({ message: "Cannot update comment" });
    }

    // Update comment status
    const validStatus =
      CommentStatus[body.status] != null ? body.status : CommentStatus.Pending;

    await commentsService.updateCommentStatus(commentId, validStatus);

    res.status(200).json({ message: "Comment updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class HideCommentBody {
  constructor(data: any) {
    this.status = data.status ?? 0;
  }

  status: CommentStatus;
}
