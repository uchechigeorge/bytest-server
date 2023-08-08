import { getDb } from "../../utils/db";
import {
  getFilterQuery,
  getOrder,
  getSearchFilters,
  getSort,
  hasSearchParams,
  isNullOrWhitespace,
  isTruthy,
} from "../../utils/type-helpers";
import { GetRequestsParams } from "../../models/Requests";
import { CommentStatus } from "../../models/Comment";

// Columns enabled for sort
const sortColumns = ["datemodified", "datecreated"];
// Columns enabled for search
const searchColumnOptions = [
  { key: "title", value: "p.Title" },
  { key: "content", value: "p.Content" },
];

interface GetPostParams extends GetRequestsParams {
  postId?: string;
  userId?: string;
  hidden?: string;
  isOwner?: boolean;
}

interface GetPostOptions {
  ownerId?: string;
}

/**
 * Fetches post records from db
 * @param params Fetch params
 * @returns Post records
 */
export const getPosts = async (
  params: GetPostParams,
  options?: GetPostOptions
) => {
  const {
    page,
    perPage,
    order,
    sort,
    searchStrings,
    searchOperators,
    searchColumns,
    searchStack,
    postId,
    userId,
    hidden,
    isOwner,
  } = params;

  const filters: any[] = [];

  let subSql = `FROM dbo.Posts [p] 
                LEFT OUTER JOIN dbo.Users [u] ON (u.Id = p.UserId)`;

  // Add filter for post
  if (!isNullOrWhitespace(postId)) {
    filters.push(`(p.Id = '${postId}')`);
  }

  // Add filter for user
  if (!isNullOrWhitespace(userId)) {
    filters.push(`(u.Id = '${userId}')`);
  }

  // Add filter for hidden status
  if (!isNullOrWhitespace(hidden)) {
    filters.push(`(p.Hidden = '${isTruthy(hidden)}')`);
  }

  // Add filter for owner
  // if (isOwner != null) {
  //   filters.push(`(IsOwner = '${isOwner}')`);
  // }

  // Add search filter
  if (hasSearchParams(searchStrings, searchColumns)) {
    const searchFilters = getSearchFilters(
      searchStrings ?? [],
      searchColumns ?? [],
      searchOperators,
      searchStack,
      {
        defaultColumn: "p.Title",
        searchColumnOptions,
      }
    );

    filters.push("(" + searchFilters + ")");
  }

  subSql = getFilterQuery(filters, subSql);

  let sql = `SELECT p.*, u.Id UserId2, u.FullName UserFullName, u.Email UserEmail, 
    IsOwner = (CASE WHEN u.Id = '${
      options?.ownerId ?? ""
    }' THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END),
    NoOfComments = (SELECT COUNT(c.Id) FROM dbo.Comments [c] WHERE c.PostId = p.Id AND c.StatusId = ${
      CommentStatus.Approved
    }),
    TotalRows = (SELECT COUNT(*) ${subSql}) ${subSql}`;

  const db = await getDb();
  const totalSql = await db.query(sql);

  // Add sort
  sql += `ORDER BY p.${getSort(sort ?? "", sortColumns)} ${getOrder(order)} `;
  // Add pagination
  sql += `OFFSET ${perPage || 50} * (${page || 1} - 1) ROWS FETCH NEXT ${
    perPage || 50
  } ROWS ONLY`;

  const result = await db.query(sql);

  const data = result.recordset;
  const total =
    totalSql.recordset.length > 0 ? totalSql.recordset[0].TotalRows : 0;
  return { data, total };
};
