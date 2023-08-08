import { addPost } from "./add-post.service";
import { deletePost } from "./delete-post.service";
import { getPosts } from "./get-posts.service";
import { updatePost, updatePostImage } from "./update-post.service";

const postsService = {
  addPost,
  updatePost,
  updatePostImage,
  deletePost,
  getPosts,
};

export default postsService;
