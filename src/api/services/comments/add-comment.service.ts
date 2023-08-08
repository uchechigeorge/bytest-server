import { CommentStatus } from "../../models/Comment";
import { getDb } from "../../utils/db";
import { formatSqlObj, isNullOrWhitespace } from "../../utils/type-helpers";

interface Comment {
  content: string;
  postId: string;
  userId: string;
  parentId?: string;
  anonymous: boolean;
  status?: CommentStatus;
  owner?: CommentOwner;
}

interface CommentOwner {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

/**
 * Adds a comment to resource
 * @param body Comment data
 * @returns Result of INSERT operation
 */
export const addComment = async (body: Comment) => {
  const data = formatSqlObj(body);

  const db = await getDb();
  const inserted =
    await db.query`INSERT INTO dbo.Comments ([PostId], [Content], [UserId], [ParentId], [StatusId], [Anonymous], [Edited]) OUTPUT inserted.* VALUES
    (${data.postId}, ${data.content}, ${data.userId}, ${data.parentId}, ${
      data.status
    }, ${data.anonymous}, ${false})`;

  if (isNullOrWhitespace(data.userId) && data.owner != null) {
    const insertedCommentId = inserted.recordset[0].Id;
    await db.query`INSERT INTO dbo.CommentOwners ([CommentId], [FirstName], [LastName], [Email], [PhoneNumber]) VALUES (${insertedCommentId}, ${data.owner.firstName}, ${data.owner.lastName}, ${data.owner.email}, ${data.owner.phone})`;
  }

  return inserted;
};
