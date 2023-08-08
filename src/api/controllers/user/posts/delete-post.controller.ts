import { Request, Response } from "express";
import postsService from "../../../services/posts";
import { getDb } from "../../../utils/db";

/**
 * API controller to delete existing post from db
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    // Get id of post from params
    const postId = req.params.id;
    // Get user details from Request object
    const user = req["user"];

    // Initialize db
    const db = await getDb();

    // Check if post exists
    const postCheck = (
      await db.query`SELECT TOP 1 p.* FROM dbo.Posts [p] WHERE p.Id = ${postId} AND p.UserId = ${user.userId}`
    ).recordset;
    if (postCheck.length < 1) {
      return res.status(400).json({ message: "Invalid post" });
    }

    // Delete post
    await postsService.deletePost(postId);

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
