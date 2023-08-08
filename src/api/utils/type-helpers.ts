/**
 * Checks to see string value is empty or whitespace
 * @param value Value to check
 * @returns Calculated boolean value
 */
export const isNullOrWhitespace = (value?: string) => {
  return value == null || value.toString()?.trim().length == 0;
};

/**
 * Checks to see string value is empty or null
 * @param value Value to check
 * @returns Calculated boolean value
 */
export const isNullOrEmpty = (value: string) => {
  return !value || value?.length == 0;
};

/**
 * Formats SQL command. Used in cases where the default mssql formating cannot be utilized
 * @param sql The SQL statement
 * @param flag Flag to determing what to replace empty values with
 * @param keyword
 * @param parse
 * @returns Formatted SQL statement
 */
export const formatSqlCmd = (
  sql: string,
  flag = FormatSqlFlag.Null,
  keyword: string | null = null,
  parse?: boolean
) => {
  switch (flag) {
    case FormatSqlFlag.Null:
      keyword = parse ? "NULL" : null;
      break;
    case FormatSqlFlag.Default:
      keyword = "DEFAULT";
      break;
    case FormatSqlFlag.WhiteSpace:
      keyword = "''";
      break;
    default:
      break;
  }

  return isNullOrWhitespace(sql)
    ? keyword
    : parse
    ? "N'" + (sql + "").replace("'", "''") + "'"
    : sql + "";
};

/**
 * Formats an object to replace whitespaces with NULL values
 * @param data Data of object
 * @param parse Parse the values
 * @returns Returns formated data
 */
export function formatSqlObj<T>(data: T, parse?: boolean): T {
  let newData: any = {};

  Object.keys(data as any).forEach((key) => {
    if (Array.isArray(data[key])) {
      newData[key] = data[key].map((i: any) => formatSqlObj(i));
    } else if (typeof data[key] === "object" && data[key] != null) {
      newData[key] = formatSqlObj(data[key]);
    } else {
      newData[key] = formatSqlCmd(data[key], undefined, undefined, parse);
    }
  });

  return newData;
}

/**
 * Generates a random string
 * @param length Lenth of string to generate
 * @param options Options for string generation
 * @returns A random string
 */
export const generateRandomString = (
  length: number = 10,
  options?: {
    type?: "alpha-numeric" | "alpha" | "numeric";
    includeSymbols?: boolean;
    caseSensitive?: boolean;
  }
) => {
  let type = options?.type;
  if (!options?.type) {
    type = "alpha-numeric";
  }

  const upperCaseLetters = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const lowerCaseLetters = "qwertyuiopasdfghjklzxcvbnm";
  const numbers = "0123456789";

  let characters = "";

  switch (type) {
    case "alpha":
      characters = upperCaseLetters;
      if (options?.caseSensitive) {
        characters += lowerCaseLetters;
      }
      break;
    case "alpha-numeric":
      characters = upperCaseLetters + numbers;
      if (options?.caseSensitive) {
        characters += lowerCaseLetters;
      }
      break;
    case "numeric":
      characters = numbers;
  }

  if (options?.includeSymbols) characters += ".,/@#%*&-+=?!";

  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString += characters[getRandom(characters.length)];
  }

  return randomString;
};

const getRandom = (max: number) => {
  return Math.floor(Math.random() * max);
};

/**
 * Determines if the value specified is truthy. Truthy values are generally `true`, `1`
 * @param value Value to check
 * @returns Where value is truthy
 */
export const isTruthy = (value: any) => {
  return value != null && (value === true || value == 1 || value === "true");
};

/**
 * Gets the appropriate column to perform sort operation.
 * If an invalid column is supplied (via `value` param), the `defaultValue` is used instead.
 * @param value Column to perform sort operation on
 * @param options Ebabked columns for sorting
 * @param defaultValue Default column for sort operatiion
 * @returns The appropriate column for a sort operation
 */
export const getSort = (
  value: string,
  options: any[],
  defaultValue: string = "DateModified"
) => {
  const sortValue =
    options.find(
      (option) =>
        (option.key != null && option.key === value) || option === value
    ) ?? defaultValue;
  return !sortValue?.value ? sortValue : sortValue.value;
};

export const getFilterColumn = (
  selectedColumn: string,
  options: any[],
  defaultValue: string
) => {
  const col = options?.find(
    (opt) =>
      (opt.key != null && opt.key === selectedColumn) || opt === selectedColumn
  );
  return (!col?.value ? col : col?.value) ?? defaultValue;
};

/**
 * Determines if the parameters provided meets the conditions to perform a search.
 * For a search condition to be met, at least, either a search string or a search value should be provided
 * @param search List of search strings
 * @param columns List of search columns
 * @returns A boolean value to determine if search condition is met
 */
export const hasSearchParams = (search?: string[], columns?: string[]) => {
  return (
    (search != null &&
      isArray(search) &&
      search.length > 0 &&
      search.some((value) => !isNullOrWhitespace(value))) ||
    (columns != null &&
      isArray(columns) &&
      columns.length > 0 &&
      search?.some((value) => !isNullOrWhitespace(value)))
  );
};

/**
 * Constructs an SQL search query based of the search parameter supplied.
 *
 * For eg, if search = `['adam', 20]`; columns = `['Title', 'Amount']`; operators = `[Contains, IsGreaterThan]`; stacks = `['AND']`,
 * then an SQL query will be generated, thus: `Title LIKE '%adam%' AND Amount > 20`.
 * @param search List of search strings
 * @param columns List of search columns
 * @param operators Lists of search operators
 * @param stacks List of search stack
 * @param options More search options
 * @returns SQL interpretation for required search
 */
export const getSearchFilters = (
  search: string[],
  columns: string[],
  operators?: string[],
  stacks?: string[],
  options?: { defaultColumn?: any; searchColumnOptions?: any[] }
) => {
  const numOfFilters = Math.max(columns.length, search.length);
  const filters = Array.from(Array(numOfFilters)).map((value, i) => {
    const filter = {
      column: getFilterColumn(
        columns[i],
        options?.searchColumnOptions ?? [],
        options?.defaultColumn
      ),
      value: search[i] ?? "",
      operator: operators ? parseInt(operators[i]) ?? 0 : 0,
      stack: stacks ? getFilterStack(stacks[i]) ?? "AND" : "AND",
    };

    return filter;
  });

  const searchQuery = filters
    .map((filter, i, arr) => {
      return `(${filter.column} ${getFilterRegex(
        filter.value,
        filter.operator
      )}) ${i < arr.length - 1 ? filter.stack : ""}`;
    }, "")
    .join(" ");

  return searchQuery;
};

/**
 * Returns the appropiate search stack value. 1 or 'or' will return the `OR` operator stack; `AND` will be returned otherwise.
 * @param value Specified search stack
 * @returns The appropriate search stack value
 */
export const getFilterStack = (value: string) => {
  return value == "1" || value?.toLowerCase() == "or" ? "OR" : "AND";
};

/**
 * Generates an SQL conditional based on the value and operation to carry out.
 *
 * Eg, If value = `'adam'`; operator = `LIKE`,
 *
 * then an SQL conditional is generated, thus: `LIKE '%adam%'`
 * @param value The search string
 * @param operator Specified search operator
 * @returns An SQL conditional statement
 */
export const getFilterRegex = (value: string, operator?: RegExOperators) => {
  switch (parseInt(operator?.toString() ?? "")) {
    case RegExOperators.Contains:
      return `LIKE '%${value}%'`;
    case RegExOperators.Equals:
      return `= '${value}'`;
    case RegExOperators.StartsWith:
      return `LIKE '${value}%'`;
    case RegExOperators.EndsWith:
      return `LIKE '%${value}'`;
    case RegExOperators.IsEmpty:
      return `IS NULL`;
    case RegExOperators.IsNotEmpty:
      return `IS NOT NULL`;
    case RegExOperators.IsGreaterThan:
      return `> '${value}'`;
    case RegExOperators.IsLessThan:
      return `< '${value}'`;
    default:
      return `LIKE '%${value}%'`;
  }
};

/**
 * Available SQL operator options
 */
export enum RegExOperators {
  Contains,
  Equals,
  StartsWith,
  EndsWith,
  IsEmpty,
  IsNotEmpty,
  IsGreaterThan,
  IsLessThan,
  IsAnyOf,
}

/**
 * Returns the appropriate order value from the specified value.
 * `ASC` will be returned by truthy values or by its own string representation; `DESC` will be returned otherwise
 * @param value Specified order
 * @returns Appropriate order value
 */
export const getOrder = (value: any) => {
  return value == "asc" || isTruthy(value) ? "ASC" : "DESC";
};

/**
 * Generates an SQL statement, appending the specified filters to the existing SQL statement
 * @param filters List of SQL filters
 * @param subSql SQL statement to append filters to
 * @returns An SQL statement with the appropriate filters
 */
export const getFilterQuery = (filters: string[], subSql: string) => {
  filters.forEach((query) => {
    if (subSql.indexOf("WHERE") == -1) {
      subSql += " WHERE " + query;
    } else {
      subSql += " AND " + query;
    }
  });

  return subSql;
};

export const isValidDate = (value: any) => {
  const date: any = new Date(value);
  const valid = value != null && !isNaN(date) && date instanceof Date;
  return valid;
};

export const isArray = (arr: any) => {
  return arr?.constructor === Array;
};

export const findDuplicates = (arr: any[]) =>
  arr.filter((item, index) => arr.indexOf(item) != index);

enum FormatSqlFlag {
  Null,
  Default,
  WhiteSpace,
}
