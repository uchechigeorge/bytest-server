import path from "path";
import fs from "fs";
import { isNullOrWhitespace } from "./type-helpers";

const fsPromises = fs.promises;

/**
 * Writes a file to disk
 * @param req Request object
 * @param options File write options
 * @returns The url of the written file
 */
export const writeFile = async (req: any, options?: WriteFileOptions) => {
  let fileUrl = "";

  if (!req.files || req.files?.length < 1) {
    return options?.defaultUrl ?? fileUrl;
  }

  const file = req.files[0];
  let paths: any[] = [];

  if (options?.dirPath?.constructor === Array) {
    paths.push(...options?.dirPath);
  } else if (options?.dirPath?.constructor === String) {
    paths.push(options?.dirPath);
  }

  const dirPath = path.join(...paths);
  const rootPath = path.join(path.resolve("./"), "public", dirPath);
  const fileName =
    (options?.fileName ?? file.fieldname + "_" + Date.now()) +
    path.extname(file.originalname);

  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true });
  }

  await fsPromises.writeFile(path.join(rootPath, fileName), file.buffer);

  fileUrl = new URL(
    path.join("files", dirPath, fileName),
    process.env.HOST ?? ""
  ).href;
  return fileUrl;
};

/**
 * Write multiple files to disk
 * @param req Request object
 * @param options File write options
 * @returns The urls of the written files
 */
export const writeMultipleFiles = async (
  req: any,
  options?: WriteFileOptions
) => {
  let fileUrls: any[] = [];

  if (req.files?.length < 1) {
    const url = options?.defaultUrl ?? "";
    fileUrls.push(url);
    return fileUrls;
  }

  const files = req.files;

  files.forEach(async (file: any, i: number) => {
    let paths: any[] = [];

    if (options?.dirPath?.constructor === Array) {
      paths.push(...options?.dirPath);
    } else if (options?.dirPath?.constructor === String) {
      paths.push(options?.dirPath);
    }

    const dirPath = path.join(...paths);
    const rootPath = path.join(path.resolve("./"), "public", dirPath);
    const fileName =
      (options?.fileName ?? file.fieldname + "_" + Date.now()) +
      i +
      path.extname(file.originalname);

    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }

    const url =
      (process.env.HOST ?? "") + path.join("files", dirPath, fileName);
    fileUrls.push(url);

    await fsPromises.writeFile(path.join(rootPath, fileName), file.buffer);
  });

  return fileUrls;
};

/**
 * If no user dp, return default user dp
 * @param url The user dp url
 * @returns Valid user dp url
 */
export const getUserDefaultDp = (url: string) => {
  if (!isNullOrWhitespace(url)) return url;

  return process.env.USER_DEFAULT_DP_URL ?? "";
};

/**
 * If no post image, return default post image
 * @param url The image of post
 * @returns Valid image for post
 */
export const getPostDefaultImage = (url: string) => {
  if (!isNullOrWhitespace(url)) return url;

  return process.env.POST_DEFAULT_IMAGE_URL ?? "";
};

// export const getAdminDefaultDp = (url: string) => {
//   if (!isNullOrWhitespace(url)) return url;

//   return process.env.ADMIN_DEFAULT_DP_URL ?? "";
// };

interface WriteFileOptions {
  fileName?: string;
  dirPath?: string | string[];
  defaultUrl?: string;
}
