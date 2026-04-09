import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  content: Joi.string().min(10).required().messages({
    "string.min": "Content must be at least 10 characters",
    "any.required": "Content is required",
  }),
  status: Joi.string().valid("draft", "published").default("draft"),
  tags: Joi.array().items(Joi.string().max(30)).max(10).default([]).messages({
    "array.max": "Cannot have more than 10 tags",
  }),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 200 characters",
  }),
  content: Joi.string().min(10).messages({
    "string.min": "Content must be at least 10 characters",
  }),
  tags: Joi.array().items(Joi.string().max(30)).max(10).messages({
    "array.max": "Cannot have more than 10 tags",
  }),
}).min(1);

export const statusSchema = Joi.object({
  status: Joi.string().valid("draft", "published").required().messages({
    "any.only": "Status must be either draft or published",
    "any.required": "Status is required",
  }),
});
