import { login } from "./login.controller";
import { sessionsLogin } from "./sessions-login.controller";
import { signUp } from "./signup.controller";

const authController = {
  signUp,
  login,
  sessionsLogin,
};

export default authController;
