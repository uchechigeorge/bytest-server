import { Request, Response } from "express";
import postsService from "../../../services/posts";
import { getDb } from "../../../utils/db";
import { isNullOrWhitespace } from "../../../utils/type-helpers";
import { writeFile } from "../../../utils/file-helper";

/**
 * API controller to update existing post record on database
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    // Get id of post from params
    const postId = req.params.id;
    // Get user details from Express Request object
    const user = req["user"];
    // Get body
    const body = new UpdatePostBody(req.body);

    // Check if title and content are available
    if (isNullOrWhitespace(body.content) || isNullOrWhitespace(body.title)) {
      return res.status(400).json({ message: "Bad request" });
    }

    // Initialize db
    const db = await getDb();

    // Check if post exists
    const postCheck = (
      await db.query`SELECT TOP 1 p.* FROM dbo.Posts [p] WHERE p.Id = ${postId} AND p.UserId = ${user.userId}`
    ).recordset;
    if (postCheck.length < 1) {
      return res.status(400).json({ message: "Invalid post" });
    }

    // Update post
    await postsService.updatePost(postId, {
      content: body.content,
      title: body.title,
      hidden: !body.publish,
    });

    res.status(200).json({ message: "Post updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * API controller to update image of existing post record on database
 * @param req Request object
 * @param res Response object
 * @returns
 */
export const updatePostImage = async (req: Request, res: Response) => {
  try {
    // Get id of post from params
    const postId = req.params.id;
    // Get user details from Express Request object
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

    // Write image
    const imageUrl = await writeFile(req, {
      dirPath: "/posts",
      fileName: "post_" + Date.now(),
    });

    // Update post
    await postsService.updatePostImage(postId, imageUrl);

    res.status(200).json({ message: "Post updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
class UpdatePostBody {
  constructor(data: any) {
    this.content = data.content;
    this.title = data.title;
    this.publish = data.publish;
  }

  content: string;
  title: string;
  publish: boolean;
}
