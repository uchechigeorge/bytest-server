/**
 * Adds a helper function to request object to help with normalizing query params.
 * This makes query params case-insensitive
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const normalizeQueryParams = (req: any, res: any, next: any) => {
  req.getQuery = (value: string) => {
    const keys =
      Object.keys(req.query).find(
        (key) => key.toLowerCase() == value.toLowerCase()
      ) ?? "";
    return req.query[keys];
  };

  next();
};

// export const normalizeFormParams = (req: any, res: any, next: any) => {

//   if(req.headers['content-type'].indexOf('multipart/form-data') != -1 || req.headers['content-type'] == 'application/x-www-form-urlencoded') {

//     req.getForm = (value: string) => {
//       const keys = Object.keys(req.body).find(key => key.toLowerCase() == value.toLowerCase()) ?? '';
//       return req.body[keys];
//     }
//   }

//   next();
// }
