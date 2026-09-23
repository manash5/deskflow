import { Request, Response } from "express";
import { agentService } from "../services/agent.service";
import { chatService } from "../services/chat.service";
import { ApiResponseHelper } from "../utils/api-response";
import { routeParam } from "../utils/params";

export const chatController = {
  async send(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await chatService.send(routeParam(req, "id"), String(req.body?.message || "")),
      200,
      "Message sent",
    );
  },

  async history(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await chatService.history(routeParam(req, "id")),
      200,
      "Chat history loaded",
    );
  },

  async publicCard(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await agentService.publicCard(routeParam(req, "companyId")),
      200,
      "Public agent loaded",
    );
  },

  async publicSend(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await chatService.sendPublic(
        routeParam(req, "companyId"),
        String(req.body?.message || ""),
      ),
      200,
      "Message sent",
    );
  },
};
