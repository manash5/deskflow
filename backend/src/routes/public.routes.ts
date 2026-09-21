import { Router } from "express";
import { agentController } from "../controllers/agent.controller";
import { chatController } from "../controllers/chat.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const catalogRouter = Router();
export const publicChatRouter = Router();

catalogRouter.get("/specialists", asyncHandler(agentController.catalog));
publicChatRouter.get("/:companyId", asyncHandler(chatController.publicCard));
publicChatRouter.post("/:companyId", asyncHandler(chatController.publicSend));
