import { Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { ApiResponseHelper } from "../utils/api-response";
import { routeParam } from "../utils/params";

export const customerController = {
  async list(_req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await customerService.list(),
      200,
      "Customers loaded",
    );
  },

  async get(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await customerService.get(routeParam(req, "id")),
      200,
      "Customer loaded",
    );
  },

  async create(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await customerService.create(req.body || {}),
      201,
      "Customer created",
    );
  },

  async update(req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await customerService.update(routeParam(req, "id"), req.body || {}),
      200,
      "Customer updated",
    );
  },

  async remove(req: Request, res: Response) {
    await customerService.remove(routeParam(req, "id"));
    return ApiResponseHelper.success(res, null, 200, "Customer removed");
  },
};
