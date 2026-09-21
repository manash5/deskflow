import { Request, Response } from "express";
import { SPECIALISTS } from "../config/specialists";
import { agentService } from "../services/agent.service";
import { routeParam } from "../utils/params";

export const agentController = {
  async catalog(_req: Request, res: Response) {
    res.json(SPECIALISTS);
  },

  async list(_req: Request, res: Response) {
    res.json(agentService.list());
  },

  async get(req: Request, res: Response) {
    res.json(agentService.get(routeParam(req, "id")));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await agentService.create(req.body || {}));
  },

  async update(req: Request, res: Response) {
    res.json(await agentService.update(routeParam(req, "id"), req.body || {}));
  },

  async knowledge(req: Request, res: Response) {
    res.json(await agentService.knowledge(routeParam(req, "id")));
  },

  async ingest(req: Request, res: Response) {
    const files = ((req.files as Express.Multer.File[]) || []).map((file) => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));
    res.json(await agentService.ingest(routeParam(req, "id"), files));
  },

  async performance(req: Request, res: Response) {
    res.json(agentService.performance(routeParam(req, "id")));
  },
};
