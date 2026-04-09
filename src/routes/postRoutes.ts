import { Router } from "express";
import {
  getPosts,
  getMyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  getAllPostsAdmin,
} from "../controllers/postController";
import { getComments, addComment } from "../controllers/commentController";
import protect from "../middleware/auth";
import authorizeRoles from "../middleware/authorizeRoles";
import validate from "../middleware/validate";
import {
  createPostSchema,
  updatePostSchema,
  statusSchema,
} from "../validators/postValidator";
import { createCommentSchema } from "../validators/commentValidator";

const router = Router();


router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/:id/comments", getComments);

router.get("/user/my", protect, getMyPosts);
router.get("/admin/all", protect, authorizeRoles("admin"), getAllPostsAdmin);

router.post(
  "/",
  protect,
  authorizeRoles("admin", "author"),
  validate(createPostSchema),
  createPost,
);

router.put("/:id", protect, validate(updatePostSchema), updatePost);
router.delete("/:id", protect, deletePost);
router.patch("/:id/status", protect, validate(statusSchema), updatePostStatus);

router.post(
  "/:id/comments",
  protect,
  validate(createCommentSchema),
  addComment,
);

export default router;
