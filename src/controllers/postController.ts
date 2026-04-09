import { Request, Response } from "express";
import Post from "../models/Post";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { PaginationResult } from "../types";
import cloudinary from "../config/cloudinary";

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    status = "published",
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    order = "desc",
    tags,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {};
  filter.status = status === "published" ? "published" : "published";

  if (search) {
    filter.$text = { $search: search };
  }

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
    filter.tags = { $in: tagList };
  }

  const sortOrder = order === "asc" ? 1 : -1;

  const sortObj: Record<string, any> = search
    ? { score: { $meta: "textScore" }, [sortBy]: sortOrder }
    : { [sortBy]: sortOrder };

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate("author", "name email"),
    Post.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPosts / limitNum);
  const pagination: PaginationResult = {
    currentPage: pageNum,
    totalPages,
    totalPosts,
    hasNext: pageNum < totalPages,
    hasPrev: pageNum > 1,
  };

  res.status(200).json({ success: true, posts, pagination });
});

export const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    status,
    search,
    sortBy = "updatedAt",
    order = "desc",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = { author: req.user!.id };
  if (status && ["draft", "published"].includes(status)) filter.status = status;
  if (search) filter.$text = { $search: search };

  const sortOrder = order === "asc" ? 1 : -1;
  const sortObj: Record<string, any> = search
    ? { score: { $meta: "textScore" }, [sortBy]: sortOrder }
    : { [sortBy]: sortOrder };

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate("author", "name email"),
    Post.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPosts / limitNum);

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalPosts,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  });
});

export const getAllPostsAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      status,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};
    if (status && ["draft", "published"].includes(status)) filter.status = status;
    if (search) filter.$text = { $search: search };

    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj: Record<string, any> = search
      ? { score: { $meta: "textScore" }, [sortBy]: sortOrder }
      : { [sortBy]: sortOrder };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("author", "name email"),
      Post.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPosts,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  },
);

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name email",
  );
  if (!post) throw new AppError(404, "Post not found");

  if (!req.user && post.status !== "published") {
    throw new AppError(404, "Post not found");
  }

  res.status(200).json({ success: true, post });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, status, tags, images } = req.body;

  const post = await Post.create({
    title,
    content,
    status,
    tags,
    images: images || [],
    author: req.user!.id,
  });

  const populated = await post.populate("author", "name email");

  res
    .status(201)
    .json({ success: true, message: "Post created", post: populated });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");

  const isOwner = post.author.toString() === req.user!.id;
  const isAdmin = req.user!.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "You are not authorized to update this post");
  }

  const { title, content, tags, status, images } = req.body;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (tags !== undefined) post.tags = tags;
  if (status !== undefined) post.status = status;
  if (images !== undefined) post.images = images;

  await post.save();
  const populated = await post.populate("author", "name email");

  res
    .status(200)
    .json({ success: true, message: "Post updated", post: populated });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");

  const isOwner = post.author.toString() === req.user!.id;
  const isAdmin = req.user!.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "You are not authorized to delete this post");
  }

  if (post.images && post.images.length > 0) {
    await Promise.allSettled(
      post.images.map((publicId: string) =>
        cloudinary.uploader.destroy(publicId, { resource_type: "image" })
      )
    );
  }

  await post.deleteOne();

  res.status(200).json({ success: true, message: "Post deleted successfully" });
});

export const updatePostStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError(404, "Post not found");

    const isOwner = post.author.toString() === req.user!.id;
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError(
        403,
        "You are not authorized to change this post status",
      );
    }

    post.status = req.body.status;
    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${req.body.status === "published" ? "published" : "unpublished"}`,
      post: { id: post._id, status: post.status },
    });
  },
);
