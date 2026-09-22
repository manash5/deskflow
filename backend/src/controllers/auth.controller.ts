import { Request, Response } from "express";
import { AuthedRequest } from "../middleware/auth.middleware";
import { authService } from "../services/auth.service";

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body || {};
    const result = await authService.login(String(email || ""), String(password || ""));
    res.json(result);
  },

  async me(req: AuthedRequest, res: Response) {
    res.json(await authService.me(req.admin!.sub));
  },
};
