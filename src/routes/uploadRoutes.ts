import { Router } from "express";
import protect from "../middleware/auth";
import upload from "../middleware/upload";
import { uploadImages, deleteImage } from "../controllers/uploadController";

const router = Router();

router.post("/image", protect, upload.array("image", 10), uploadImages);

router.delete("/image", protect, deleteImage);

export default router;
