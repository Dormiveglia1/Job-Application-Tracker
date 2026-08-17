import { Router } from "express";
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  updateApplication,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = Router();

router.get("/", authenticateToken, getApplications);

router.post("/", authenticateToken, createApplication);

router.get("/:applicationId", authenticateToken, getApplicationById);

router.put("/:applicationId", authenticateToken, updateApplication);

router.delete("/:applicationId", authenticateToken, deleteApplication);

router.patch(
  "/:applicationId/status",
  authenticateToken,
  updateApplicationStatus,
);

export default router;
