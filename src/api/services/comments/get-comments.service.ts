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
const searchColumnOptions = [{ key: "content", value: "c.Content" }];

interface GetCommentParams extends GetRequestsParams {
  commentId?: string;
  postId?: string;
  userId?: string;
  status?: string;
  parentId?: string;
  /**
   * Flag to determine if the comment was created by a particular user
   */
  isOwner?: boolean;
  /**
   * Flag to determine if the comment is for a post owner by a particular user
   */
  isPostOwner?: boolean;
}

interface GetCommentOptions {
  ownerId?: string;
  postOwnerId?: string;
}

/**
 * Fetches comment records from db
 * @param params Fetch params
 * @param options Options for fetching data
 * @returns Post records
 */
export const getComments = async (
  params: GetCommentParams,
  options?: GetCommentOptions
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
    commentId,
    postId,
    userId,
    isOwner,
    isPostOwner,
    status,
    parentId,
  } = params;

  const filters: any[] = [];

  // Base SQL query
  let subSql = `FROM dbo.Comments [c]
  LEFT OUTER JOIN dbo.CommentOwners [co] ON (co.CommentId = c.Id)
  LEFT OUTER JOIN dbo.Posts [p] ON (p.Id = c.PostId)
  LEFT OUTER JOIN dbo.Users [u] ON (u.Id = c.UserId)`;

  // Add filter for comment
  if (!isNullOrWhitespace(commentId)) {
    filters.push(`(c.Id = '${commentId}')`);
  }

  // Add filter for post
  if (!isNullOrWhitespace(postId)) {
    filters.push(`(p.Id = '${postId}')`);
  }

  // Add filter for user
  if (!isNullOrWhitespace(userId)) {
    filters.push(`(u.Id = '${userId}')`);
  }

  // Add filter for parent
  if (!isNullOrWhitespace(parentId)) {
    if (parentId != "all") {
      filters.push(`(c.ParentId = '${parentId}')`);
    }
  } else {
    filters.push(`(c.ParentId IS NULL)`);
  }

  // Add filter for status
  const hasStatusParam = !isNullOrWhitespace(status);
  const validStatus = parseInt(status ?? "") as CommentStatus;
  if (hasStatusParam) {
    // If status is valid (.ie, is a number), add filter
    if (!isNaN(validStatus)) {
      filters.push(`(c.StatusId = '${validStatus}')`);
    }
  }

  // Add filter for owner
  if (isOwner != null || isPostOwner != null) {
    // if (isOwner && isPostOwner) {
    //   filters.push(
    //     `(IsOwner = '${isOwner}' OR IsPostOwner = '${isPostOwner}')`
    //   );
    // } else {
    //   // Add filter for post owner
    //   if (isOwner != null) {
    //     filters.push(`(IsPostOwner = '${isOwner}')`);
    //   }
    //   if (isPostOwner != null) {
    //     filters.push(`(IsPostOwner = '${isPostOwner}')`);
    //   }
    // }
  }

  // Add search filter
  if (hasSearchParams(searchStrings, searchColumns)) {
    const searchFilters = getSearchFilters(
      searchStrings ?? [],
      searchColumns ?? [],
      searchOperators,
      searchStack,
      {
        defaultColumn: "c.Content",
        searchColumnOptions,
      }
    );

    filters.push("(" + searchFilters + ")");
  }

  subSql = getFilterQuery(filters, subSql);

  let sql = `SELECT c.*, 
    p.Id PostId2, p.Title PostTitle, p.UserId PostUserId, 
    u.Id UserId2, (COALESCE(u.FullName, co.FullName, 'Internet User')) UserFullName, (ISNULL(u.Email, co.Email)) UserEmail, u.DpUrl UserDpUrl,
    NoOfReplies = (SELECT COUNT(cc.Id) FROM dbo.Comments [cc] WHERE cc.ParentId = c.Id ${
      hasStatusParam && !isNaN(validStatus)
        ? "AND  cc.StatusId = '" + validStatus + "'"
        : ""
    }), 
    IsOwner = (CASE WHEN u.Id = '${
      options?.ownerId ?? ""
    }' THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END), 
    IsPostOwner = (CASE WHEN p.UserId = '${
      options?.postOwnerId ?? ""
    }' THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END), 
    TotalRows = (SELECT COUNT(*) ${subSql}) ${subSql} `;

  // console.log(sql);
  const db = await getDb();
  const totalSql = await db.query(sql);

  // Add sort
  sql += `ORDER BY ${getSort(sort ?? "", sortColumns)} ${getOrder(order)} `;
  // Add pagination
  sql += `OFFSET ${perPage || 50} * (${page || 1} - 1) ROWS FETCH NEXT ${
    perPage || 50
  } ROWS ONLY`;

  const result = await db.query(sql);

  const data = result.recordset;
  // Get total amount of records
  const total =
    totalSql.recordset.length > 0 ? totalSql.recordset[0].TotalRows : 0;
  return { data, total };
};
