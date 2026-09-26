import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { ApiResponseHelper } from "../utils/api-response";

export const dashboardController = {
  async overview(_req: Request, res: Response) {
    return ApiResponseHelper.success(
      res,
      await dashboardService.overview(),
      200,
      "Dashboard loaded",
    );
  },
};
