export interface GetRequestsParams {
  /**
   * Zero-based page index
   */
  page?: number;
  /**
   * Number of pages to fetch
   */
  perPage?: number;
  /**
   * Specifies the order with which records will be returned, ie. ASD OR DESC
   */
  order?: string;
  /**
   * The column to perform sort operation on
   */
  sort?: string;
  /**
   * List of string values to perform search query
   */
  searchStrings?: string[];
  /**
   * List of columns to perform search query
   */
  searchColumns?: string[];
  /**
   * The type of search to be performed, eg. =, >=, LIKE, etc
   */
  searchOperators?: any[];
  /**
   * Determines if to search using 'AND' or 'OR' operator
   */
  searchStack?: string[];
}
