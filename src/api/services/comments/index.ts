import { addComment } from "./add-comment.service";
import { deleteComment } from "./delete-comment.service";
import { getComments } from "./get-comments.service";
import { editComment, updateCommentStatus } from "./update-comment.service";

const commentsService = {
  addComment,
  deleteComment,
  editComment,
  updateCommentStatus,
  getComments,
};

export default commentsService;
