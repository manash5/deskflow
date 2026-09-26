import { Request, Response } from "express";
import { AuthedRequest } from "../middleware/auth.middleware";
import { authService } from "../services/auth.service";
import { ApiResponseHelper } from "../utils/api-response";

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body || {};
    const result = await authService.login(String(email || ""), String(password || ""));
    return ApiResponseHelper.success(res, result, 200, "Logged in");
  },

  async me(req: AuthedRequest, res: Response) {
    return ApiResponseHelper.success(
      res,
      await authService.me(req.admin!.sub),
      200,
      "Current admin",
    );
  },
};
