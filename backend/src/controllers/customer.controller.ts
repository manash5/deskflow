import { Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { routeParam } from "../utils/params";

export const customerController = {
  async list(_req: Request, res: Response) {
    res.json(await customerService.list());
  },

  async get(req: Request, res: Response) {
    res.json(await customerService.get(routeParam(req, "id")));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await customerService.create(req.body || {}));
  },

  async update(req: Request, res: Response) {
    res.json(await customerService.update(routeParam(req, "id"), req.body || {}));
  },

  async remove(req: Request, res: Response) {
    await customerService.remove(routeParam(req, "id"));
    res.status(204).end();
  },
};
