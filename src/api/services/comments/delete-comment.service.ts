import { getDb } from "../../utils/db";

/**
 * Deletes a comment from resource
 * @param id The id of the comment
 * @returns Result of DELETE operation
 */
export const deleteComment = async (id: string) => {
  const db = await getDb();
  const deleted = await db.query`DELETE FROM dbo.Comments WHERE Id = ${id}`;

  return deleted;
};
