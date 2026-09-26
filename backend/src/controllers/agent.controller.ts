import { Request, Response } from "express";
import { SPECIALISTS } from "../config/specialists";
import { agentService } from "../services/agent.service";
import { ApiResponseHelper } from "../utils/api-response";
import { routeParam } from "../utils/params";

export const agentController = {
  async catalog(_req: Request, res: Response) {
    return ApiResponseHelper.success(res, SPECIALISTS, 200, "Specialists loaded");
  },

  async list(_req: Request, res: Response) {
    return ApiResponseHelper.success(res, await agentService.list(), 200, "Agents loaded");
  },

  async get(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await agentService.get(routeParam(req, "id")),
      200,
      "Agent loaded",
    );
  },

  async create(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await agentService.create(req.body || {}),
      201,
      "Agent created",
    );
  },

  async update(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await agentService.update(routeParam(req, "id"), req.body || {}),
      200,
      "Agent updated",
    );
  },

  async knowledge(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await agentService.knowledge(routeParam(req, "id")),
      200,
      "Knowledge loaded",
    );
  },

  async ingest(req: Request, res: Response) {
    const files = ((req.files as Express.Multer.File[]) || []).map((file) => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));
    return ApiResponseHelper.success(
      res,
      await agentService.ingest(routeParam(req, "id"), files),
      200,
      "Documents ingested",
    );
  },

  async performance(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await agentService.performance(routeParam(req, "id")),
      200,
      "Performance loaded",
    );
  },
};
