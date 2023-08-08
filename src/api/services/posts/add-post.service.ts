import { getDb } from "../../utils/db";
import { formatSqlObj } from "../../utils/type-helpers";

interface Post {
  title: string;
  content: string;
  userId: string;
  imageUrl?: string;
  hidden: boolean;
}

/**
 * Adds a new post to resource
 * @param body Post data
 * @returns The result of INSERT operation
 */
export const addPost = async (body: Post) => {
  const data = formatSqlObj(body);

  const db = await getDb();
  const inserted =
    await db.query`INSERT INTO dbo.Posts ([Title], [Content], [UserId], [Hidden], [ImageUrl]) OUTPUT inserted.* VALUES 
    (${data.title}, ${data.content}, ${data.userId}, ${data.hidden}, ${data.imageUrl})`;

  return inserted;
};
