import { Router } from "express";
import authController from "../../controllers/user/auth";
import { authenticate } from "../../middleware/user-auth.middleware";

var authRoutes = Router();

authRoutes.post("/signup", authController.signUp);
authRoutes.post("/login", authController.login);
authRoutes.get("/sessions-login", authenticate(), authController.sessionsLogin);

export default authRoutes;
