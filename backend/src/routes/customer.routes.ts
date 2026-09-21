import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const customerRouter = Router();

customerRouter.get("/", asyncHandler(customerController.list));
customerRouter.post("/", asyncHandler(customerController.create));
customerRouter.get("/:id", asyncHandler(customerController.get));
customerRouter.patch("/:id", asyncHandler(customerController.update));
customerRouter.delete("/:id", asyncHandler(customerController.remove));
