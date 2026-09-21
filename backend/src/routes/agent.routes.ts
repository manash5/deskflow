import { Router } from "express";
import multer from "multer";
import { agentController } from "../controllers/agent.controller";
import { chatController } from "../controllers/chat.controller";
import { asyncHandler } from "../utils/asyncHandler";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 12 },
});

export const agentRouter = Router();

agentRouter.get("/", asyncHandler(agentController.list));
agentRouter.post("/", asyncHandler(agentController.create));
agentRouter.get("/:id", asyncHandler(agentController.get));
agentRouter.patch("/:id", asyncHandler(agentController.update));
agentRouter.get("/:id/knowledge", asyncHandler(agentController.knowledge));
agentRouter.post(
  "/:id/ingest",
  upload.array("files"),
  asyncHandler(agentController.ingest),
);
agentRouter.get("/:id/performance", asyncHandler(agentController.performance));
agentRouter.get("/:id/chat", asyncHandler(chatController.history));
agentRouter.post("/:id/chat", asyncHandler(chatController.send));
