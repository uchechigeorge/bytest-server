import express from "express";
import authRoutes from "./auth.routes";
import commentsRoutes from "./comments.routes";
import postsRoutes from "./posts.routes";
import usersRoutes from "./users.routes";

const userRoutes = express.Router();

userRoutes.use("/auth", authRoutes);
userRoutes.use("/users", usersRoutes);
userRoutes.use("/posts", postsRoutes);
userRoutes.use("/comments", commentsRoutes);

export default userRoutes;
