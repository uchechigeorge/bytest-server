import { getDb } from "../../utils/db";
import {
  getFilterQuery,
  getOrder,
  getSearchFilters,
  getSort,
  hasSearchParams,
  isNullOrWhitespace,
} from "../../utils/type-helpers";
import { GetRequestsParams } from "../../models/Requests";

// Columns enabled for sort
const sortColumns = ["datemodified", "datecreated"];
// Columns enabled for search
const searchColumnOptions = [
  { key: "name", value: "u.FullName" },
  { key: "email", value: "u.Email" },
];

interface GetUserParams extends GetRequestsParams {
  userId?: string;
}

/**
 * Fetches user records from db
 * @param params Fetch params
 * @returns User records
 */
export const getUsers = async (params: GetUserParams) => {
  const {
    page,
    perPage,
    order,
    sort,
    searchStrings,
    searchOperators,
    searchColumns,
    searchStack,
    userId,
  } = params;

  const filters: any[] = [];

  let subSql = `FROM dbo.Users [u]`;

  // Add filter for user
  if (!isNullOrWhitespace(userId)) {
    filters.push(`(u.Id = '${userId}')`);
  }

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

  let sql = `SELECT u.*,
    TotalRows = (SELECT COUNT(*) ${subSql}) ${subSql}`;

  const db = await getDb();
  const totalSql = await db.query(sql);

  sql += `ORDER BY u.${getSort(sort ?? "", sortColumns)} ${getOrder(order)} `;
  sql += `OFFSET ${perPage || 50} * (${page || 1} - 1) ROWS FETCH NEXT ${
    perPage || 50
  } ROWS ONLY`;

  const result = await db.query(sql);

  const data = result.recordset;
  const total =
    totalSql.recordset.length > 0 ? totalSql.recordset[0].TotalRows : 0;
  return { data, total };
};
