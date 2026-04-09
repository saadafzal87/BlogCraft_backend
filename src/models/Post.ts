import mongoose, { Schema } from "mongoose";
import { IPost } from "../types";

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) => tags.map((t) => t.toLowerCase().trim()),
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

PostSchema.index({ title: "text", tags: "text" });

PostSchema.index({ author: 1, status: 1 });

PostSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Post = mongoose.model<IPost>("Post", PostSchema);
export default Post;
