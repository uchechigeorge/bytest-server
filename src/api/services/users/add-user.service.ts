import { getDb } from "../../utils/db";
import { formatSqlObj } from "../../utils/type-helpers";

interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  username?: string;
  token?: string;
}

/**
 * Adds a user to database
 * @param body User details
 * @returns Result of insert operation
 */
export const addUser = async (body: User) => {
  const db = await getDb();
  const data = formatSqlObj(body);

  const insertedResult =
    await db.query`INSERT INTO dbo.Users ([Email], [Username], [Password], [FirstName], [LastName], [Token]) OUTPUT inserted.* VALUES 
    (${data.email}, ${data.username}, ${data.password}, ${data.firstName}, ${data.lastName}, ${data.token})`;

  return insertedResult;
};
