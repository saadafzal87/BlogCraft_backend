import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import { asyncHandler } from "../middleware/errorHandler";

export const getPostStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const [postStats, topAuthors, totalUsers, totalComments] =
      await Promise.all([
        Post.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        Post.aggregate([
          { $match: { status: "published" } },
          {
            $group: {
              _id: "$author",
              postCount: { $sum: 1 },
            },
          },
          { $sort: { postCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "authorInfo",
            },
          },
          { $unwind: "$authorInfo" },
          {
            $project: {
              _id: 0,
              author: {
                id: "$authorInfo._id",
                name: "$authorInfo.name",
                email: "$authorInfo.email",
              },
              postCount: 1,
            },
          },
        ]),

        User.countDocuments(),
        Comment.countDocuments(),
      ]);

    const totalPosts = postStats.reduce((sum, s) => sum + s.count, 0);
    const publishedPosts =
      postStats.find((s) => s._id === "published")?.count ?? 0;
    const draftPosts = postStats.find((s) => s._id === "draft")?.count ?? 0;

    res.status(200).json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
        totalComments,
        topAuthors,
      },
    });
  },
);

export const getMyStats = asyncHandler(async (req: Request, res: Response) => {
  const postStats = await Post.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(req.user!.id) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalPosts = postStats.reduce((sum, s) => sum + s.count, 0);
  const publishedPosts = postStats.find((s) => s._id === "published")?.count ?? 0;
  const draftPosts = postStats.find((s) => s._id === "draft")?.count ?? 0;

  res.status(200).json({
    success: true,
    stats: {
      totalPosts,
      publishedPosts,
      draftPosts,
    },
  });
});
