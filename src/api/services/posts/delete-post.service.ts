import { getDb } from "../../utils/db";

/**
 * Deletes a post from resource
 * @param id The id of post
 * @returns The result of the DELETE operation
 */
export const deletePost = async (id: string) => {
  const db = await getDb();
  const deleted = await db.query`DELETE FROM dbo.Posts WHERE Id = ${id}`;

  return deleted;
};
