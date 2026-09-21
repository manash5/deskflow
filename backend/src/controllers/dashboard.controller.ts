import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async overview(_req: Request, res: Response) {
    res.json(await dashboardService.overview());
  },
};
