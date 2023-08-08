import { Request, Response } from "express";
import { CommentStatus } from "../../../models/Comment";
import commentsService from "../../../services/comments";
import userService from "../../../services/users";
import { hashPassword } from "../../../utils/crypto-helpers";
import { getDb } from "../../../utils/db";
import {
  generateRandomString,
  isNullOrWhitespace,
} from "../../../utils/type-helpers";
import crypto from "crypto";

/**
 * API controller to add a comment to database
 * @param req Request
 * @param res Response
 * @returns
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const body = new AddCommentBody(req.body);
    const user = req["user"];

    // Check if post and content of comment are available
    if (isNullOrWhitespace(body.postId) || isNullOrWhitespace(body.content)) {
      return res.status(400).json({ message: "Bad request" });
    }

    // If user is not logged in, make sure email and name are available
    const hasOwner =
      !isNullOrWhitespace(body.owner?.email) &&
      !isNullOrWhitespace(body.owner?.firstName) &&
      !isNullOrWhitespace(body.owner?.lastName);

    if (!user?.loggedIn && !hasOwner) {
      return res.status(400).json({ message: "Bad request" });
    }

    // Initialize db
    const db = await getDb();

    // Check if post exists
    const postCheck = (
      await db.query`SELECT TOP 1 p.* FROM dbo.Posts [p] WHERE p.Id = ${body.postId}`
    ).recordset;
    if (postCheck.length < 1) {
      return res.status(400).json({ message: "Invalid post" });
    }

    // If comment has a parent
    if (!isNullOrWhitespace(body.parentId)) {
      // Check if comment exists
      const commentCheck = (
        await db.query`SELECT TOP 1 c.* FROM dbo.Comments [c] WHERE c.Id = ${body.parentId}`
      ).recordset;
      if (commentCheck.length < 1) {
        return res.status(400).json({ message: "Invalid parent comment" });
      }
    }

    let userSaveSuccess = false;
    let userId: string = "";
    let userPassword: string = "";
    let generatedJwtToken: string = "";

    // If 'not logged-in' user opts to save details, sign him up
    if (body.saveOwnerDetails && hasOwner && !user.loggedIn) {
      const ownerDetails = body?.owner;

      // Check if there is an existing email/username
      var duplicateCheck = (
        await db.query`SELECT TOP 1 * FROM dbo.Users u WHERE [u].[Email] = ${ownerDetails?.email}`
      ).recordset;

      if (duplicateCheck.length < 1) {
        // Generate token for login
        const userToken = crypto.randomBytes(32).toString("hex");
        // Generate password for user
        userPassword = generateRandomString(10, {
          type: "alpha-numeric",
          caseSensitive: true,
          includeSymbols: true,
        });

        // Add user
        const userInsert = await userService.addUser({
          email: ownerDetails?.email ?? "",
          password: hashPassword(userPassword),
          firstName: ownerDetails?.firstName ?? "",
          lastName: ownerDetails?.lastName ?? "",
          token: userToken,
        });

        userId = userInsert.recordset[0].Id;

        // Generate jwt token for user login
        generatedJwtToken = userService.generateJwtToken(userId, userToken);
        userSaveSuccess = true;
      }
    }

    // Add comment
    await commentsService.addComment({
      content: body.content,
      postId: body.postId,
      // If user was saved, use saved user id
      userId: userSaveSuccess ? userId : user.userId,
      parentId: body.parentId,
      anonymous: body.anonymous,
      status: CommentStatus.Pending,
      // If user was saved, set owner to null as userId will contain saved user id
      owner: userSaveSuccess ? undefined : body.owner,
    });

    res.status(201).json({
      message:
        "Comment created. The owner of the post will approve your comment.",
      meta: {
        userSaveSuccess,
        userDetails: !userSaveSuccess
          ? null
          : {
              token: generatedJwtToken,
              credentials: await userService.getUserCredentials(null, userId),
              password: userPassword,
            },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

class AddCommentBody {
  constructor(data: any) {
    this.content = data.content;
    this.postId = data.postId;
    this.parentId = data.parentId;
    this.anonymous = data.anonymous ?? false;
    this.owner = data.owner;
    this.saveOwnerDetails = data.saveOwnerDetails;
  }

  content: string;
  postId: string;
  parentId: string;
  anonymous: boolean;
  owner?: { firstName: string; lastName: string; email: string; phone: string };
  saveOwnerDetails?: boolean;
}
