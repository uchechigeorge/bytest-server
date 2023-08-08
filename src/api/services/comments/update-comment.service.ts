import { CommentStatus } from "../../models/Comment";
import { getDb } from "../../utils/db";
import { formatSqlObj } from "../../utils/type-helpers";

interface Comment {
  content: string;
}

/**
 * Updates the content of an existing comment in the resource
 * @param id The id of comment
 * @param body Comment data
 * @returns The result of UPDATE operation
 */
export const editComment = async (id: string, body: Comment) => {
  const data = formatSqlObj(body);

  const db = await getDb();
  const updated = await db.query`UPDATE dbo.Comments SET [Content] = ${
    data.content
  }, [Edited] = ${true}, LastEditedAt = GETUTCDATE(), DateModified = GETUTCDATE() WHERE Id = ${id}`;

  return updated;
};

/**
 *
 * @param id The id of comment
 * @param status Flag to determine the status of a comment
 * @returns The result of UPDATE operation
 */
export const updateCommentStatus = async (
  id: string,
  status: CommentStatus
) => {
  const db = await getDb();
  const updated =
    await db.query`UPDATE dbo.Comments SET [StatusId] = ${status}, DateModified = GETUTCDATE() WHERE Id = ${id}`;

  return updated;
};
