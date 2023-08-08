import { Request, Response } from "express";
import postsService from "../../../services/posts";
import { isNullOrWhitespace } from "../../../utils/type-helpers";
import { writeFile } from "../../../utils/file-helper";

/**
 * API controller to add post to database
 * @param req Request
 * @param res Response
 * @returns
 */
export const addPost = async (req: Request, res: Response) => {
  try {
    const body = new AddPostBody(req.body);
    const user = req["user"];

    // Check if title and content of post are available
    if (isNullOrWhitespace(body.title) || isNullOrWhitespace(body.content)) {
      return res.status(400).json({ message: "Bad request" });
    }

    // Write image
    const imageUrl = await writeFile(req, {
      dirPath: "/posts",
      fileName: "post_" + Date.now(),
    });

    // Add post
    await postsService.addPost({
      content: body.content,
      title: body.title,
      hidden: !body.publish,
      userId: user.userId,
      imageUrl,
    });

    res.status(201).json({ message: "Post created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class AddPostBody {
  constructor(data: any) {
    this.content = data.content;
    this.title = data.title;
    this.publish = data.publish;
  }

  content: string;
  title: string;
  publish: boolean;
}
