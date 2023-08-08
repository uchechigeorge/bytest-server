import { Router } from "express";
import usersController from "../../controllers/user/users";
import { authenticate } from "../../middleware/user-auth.middleware";

var usersRoutes = Router();

usersRoutes.get("/", authenticate(), usersController.getUsers);
usersRoutes.get("/:id", authenticate(), usersController.getUser);

export default usersRoutes;
