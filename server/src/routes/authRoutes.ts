import { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", logoutHandler);
