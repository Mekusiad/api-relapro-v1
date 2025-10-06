import express from "express";

import {
  authController,
  getMeController,
  logoutController,
  refreshTokenController,
} from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";

export const authRoutes = express.Router();

// Rota para efetuar o login
authRoutes.post("/login", authController);
// Rota para renovar o accessToken usando o refreshToken
authRoutes.post("/refresh-token", refreshTokenController);
// Rota para invalidar a sessão e fazer logout
authRoutes.post("/logout", logoutController);
// Retorna dados do usuário logado (protegida)
authRoutes.get("/me", protect, getMeController);
