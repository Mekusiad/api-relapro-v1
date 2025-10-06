import {
  authService,
  logoutService,
  meService,
  refreshTokenService,
} from "../services/authServices.js";
import { handleError } from "../utils/errorHandler.js";

export const authController = async (req, res) => {
  try {
    await authService(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    await refreshTokenService(req, res);
  } catch (error) {
    return handleError(
      res,
      error,
      "Não foi possível renovar o token de acesso."
    );
  }
};

export const logoutController = async (req, res) => {
  try {
    await logoutService(req, res);
  } catch (error) {
    return handleError(res, error, "Não foi possível fazer o logout.");
  }
};

/**
 * Retorna os dados do usuário atualmente autenticado.
 * Esta função só é chamada se o middleware 'protect' for bem-sucedido.
 */
export const getMeController = async (req, res) => {
  try {
    await meService(req, res);
  } catch (error) {
    return handleError(res, error, "Erro interno do servidor.");
  }
};
