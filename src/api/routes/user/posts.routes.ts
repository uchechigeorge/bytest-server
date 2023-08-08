import { Router } from "express";
import postsController from "../../controllers/user/posts";
import { authenticate } from "../../middleware/user-auth.middleware";

var postsRoutes = Router();

postsRoutes.get(
  "/",
  authenticate({ ignoreAuth: true }),
  postsController.getPosts
);
postsRoutes.get(
  "/:id",
  authenticate({ ignoreAuth: true }),
  postsController.getPost
);
postsRoutes.post("/", authenticate(), postsController.addPost);
postsRoutes.patch("/:id", authenticate(), postsController.updatePost);
postsRoutes.patch(
  "/:id/image",
  authenticate(),
  postsController.updatePostImage
);
postsRoutes.delete("/:id", authenticate(), postsController.deletePost);

export default postsRoutes;
