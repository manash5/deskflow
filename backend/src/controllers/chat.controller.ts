import { Request, Response } from "express";
import { agentService } from "../services/agent.service";
import { chatService } from "../services/chat.service";
import { routeParam } from "../utils/params";

export const chatController = {
  async send(req: Request, res: Response) {
    res.json(
      await chatService.send(routeParam(req, "id"), String(req.body?.message || "")),
    );
  },

  async history(req: Request, res: Response) {
    res.json(chatService.history(routeParam(req, "id")));
  },

  async publicCard(req: Request, res: Response) {
    res.json(agentService.publicCard(routeParam(req, "companyId")));
  },

  async publicSend(req: Request, res: Response) {
    res.json(
      await chatService.sendPublic(
        routeParam(req, "companyId"),
        String(req.body?.message || ""),
      ),
    );
  },
};
