import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { AppError, asyncHandler } from "../middleware/errorHandler";

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");

  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: -1 })
    .populate("author", "name email");

  res.status(200).json({
    success: true,
    comments,
  });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");

  if (post.status !== "published") {
    throw new AppError(400, "Cannot comment on a draft post");
  }

  const comment = await Comment.create({
    content: req.body.content,
    author: req.user!.id,
    post: req.params.id,
  });

  const populated = await comment.populate("author", "name email");

  res
    .status(201)
    .json({ success: true, message: "Comment added", comment: populated });
});
