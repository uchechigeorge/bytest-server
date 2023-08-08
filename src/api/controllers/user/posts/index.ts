import { addPost } from "./add-post.controller";
import { deletePost } from "./delete-post.controller";
import { getPost, getPosts } from "./get-posts.controller";
import { updatePost, updatePostImage } from "./update-post.controller";

const postsController = {
  addPost,
  updatePost,
  updatePostImage,
  deletePost,
  getPosts,
  getPost,
};

export default postsController;
