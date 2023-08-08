import { Router } from "express";
import commentsController from "../../controllers/user/comments";
import { authenticate } from "../../middleware/user-auth.middleware";

var commentsRoutes = Router();

commentsRoutes.get(
  "/",
  authenticate({ ignoreAuth: true }),
  commentsController.getComments
);
commentsRoutes.post(
  "/",
  authenticate({ ignoreAuth: true }),
  commentsController.addComment
);
commentsRoutes.patch("/:id", authenticate(), commentsController.editComment);
commentsRoutes.patch(
  "/:id/status",
  authenticate(),
  commentsController.updateCommentStatus
);
commentsRoutes.delete("/:id", authenticate(), commentsController.deleteComment);

export default commentsRoutes;
