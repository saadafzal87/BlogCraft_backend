import { Router } from "express";
import { getPostStats, getMyStats } from "../controllers/statsController";
import protect from "../middleware/auth";
import authorizeRoles from "../middleware/authorizeRoles";

const router = Router();

router.get("/my", protect, getMyStats);

router.get("/posts", protect, authorizeRoles("admin"), getPostStats);

export default router;
