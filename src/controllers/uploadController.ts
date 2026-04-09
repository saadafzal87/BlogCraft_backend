import { Request, Response } from "express";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary";
import { asyncHandler, AppError } from "../middleware/errorHandler";

const FOLDER = process.env.CLOUDINARY_FOLDER || "images";

const streamUpload = (
  buffer: Buffer,
  options: object
): Promise<{ secure_url: string; public_id: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error || new Error("Upload failed"));
      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      });
    });
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw new AppError(400, "No image files provided");
  }

  const uploaded = await Promise.all(
    files.map((file) =>
      streamUpload(file.buffer, {
        folder: FOLDER,
        resource_type: "image",
        transformation: [
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      })
    )
  );

  res.status(200).json({
    success: true,
    images: uploaded.map((img) => ({
      url: img.secure_url,
      publicId: img.public_id,
      width: img.width,
      height: img.height,
    })),
  });
});


export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.body as { publicId?: string };

  if (!publicId) {
    throw new AppError(400, "publicId is required");
  }

  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError(500, "Failed to delete image from Cloudinary");
  }

  res.status(200).json({ success: true, message: "Image deleted" });
});
