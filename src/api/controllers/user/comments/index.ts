import { addComment } from "./add-comment.controller";
import { deleteComment } from "./delete-comment.controller";
import { getComments } from "./get-comments.controller";
import { editComment, updateCommentStatus } from "./update-comment.controller";

const commentsController = {
  addComment,
  updateCommentStatus,
  editComment,
  deleteComment,
  getComments,
};

export default commentsController;
