import { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler } from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

export const authRouter = Router();

authRouter.post("/login", authRateLimiter, loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", logoutHandler);
