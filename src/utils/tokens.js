// src/utils/tokens.js

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

// Gera todos os tokens necessários para o login
export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const csrfToken = crypto.randomBytes(32).toString('hex');

  return { accessToken, refreshToken, csrfToken };
};

// Verifica o Access Token
export const verifyAccessToken = (token) => {
  try {
    console.log("Token gerado.")
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Gera o Refresh Token
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Cria o hash de um token (para o refresh token no banco de dados)
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Calcula a data de expiração do Refresh Token
export const refreshExpireAt = () => {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_DAYS);
  return expires;
};

// Gera o token CSRF
export const generateCsrfToken = (len = Number(process.env.CSRF_TOKEN_LENGTH || 32)) => {
  return crypto.randomBytes(len).toString('hex');
};