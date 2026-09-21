import { Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { routeParam } from "../utils/params";

export const customerController = {
  async list(_req: Request, res: Response) {
    res.json(customerService.list());
  },

  async get(req: Request, res: Response) {
    res.json(customerService.get(routeParam(req, "id")));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(customerService.create(req.body || {}));
  },

  async update(req: Request, res: Response) {
    res.json(customerService.update(routeParam(req, "id"), req.body || {}));
  },

  async remove(req: Request, res: Response) {
    customerService.remove(routeParam(req, "id"));
    res.status(204).end();
  },
};
