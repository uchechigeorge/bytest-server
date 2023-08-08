import { Request, Response } from "express";
import commentsService from "../../../services/comments";
import { getDb } from "../../../utils/db";

/**
 * API controller to delete existing comment from db
 * This action can be taken by the creator of the comment only
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    // Get id of comment from params
    const commentId = req.params.id;
    // Get user details from Request object
    const user = req["user"];

    // Initialize db
    const db = await getDb();

    // Check if comment exists
    const commentCheck = (
      await db.query`SELECT TOP 1 c.* FROM dbo.Comments [c] WHERE c.Id = ${commentId} AND c.UserId = ${user.userId}`
    ).recordset;
    if (commentCheck.length < 1) {
      return res.status(400).json({ message: "Invalid comment" });
    }

    // Delete comment
    await commentsService.deleteComment(commentId);

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
