import { addUser } from "./add-user.service";
import { generateJwtToken, getUserCredentials } from "./auth.service";
import { getUsers } from "./get-user.service";

const userService = {
  addUser,
  generateJwtToken,
  getUserCredentials,
  getUsers,
};

export default userService;
