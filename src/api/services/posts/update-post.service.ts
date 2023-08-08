import { getDb } from "../../utils/db";
import { formatSqlObj } from "../../utils/type-helpers";

interface Post {
  title: string;
  content: string;
  hidden?: boolean;
}

/**
 * Updates an existing post from resource
 * @param id The id of post
 * @param body Post data
 * @returns The result of the UPDATE operation
 */
export const updatePost = async (id: string, body: Post) => {
  const data = formatSqlObj(body);

  const db = await getDb();
  const updated =
    await db.query`UPDATE dbo.Posts SET [Title] = ${data.title}, [Content] = ${data.content}, [Hidden] = ${data.hidden}, DateModified = GETUTCDATE() WHERE Id = ${id}`;

  return updated;
};

export const updatePostImage = async (id: string, imageUrl: string) => {
  const data = formatSqlObj({ imageUrl });

  const db = await getDb();
  const updated =
    await db.query`UPDATE dbo.Posts SET [ImageUrl] = ${data.imageUrl}, DateModified = GETUTCDATE() WHERE Id = ${id}`;

  return updated;
};
