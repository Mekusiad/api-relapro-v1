import dotenv from 'dotenv';
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron"

import { authRoutes } from "./routes/authRoutes.js";
import { homeRoutes } from "./routes/homeRoutes.js";
import { limparRefreshTokensExpirados } from "./services/cronServices.js";
import { uploadImageRoutes } from "./routes/uploadImageRoutes.js";

dotenv.config();

import "./config/cloudinary.js";

const app = express();

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// --- INÍCIO DA CORREÇÃO ---

// Lista de origens permitidas
const allowedOrigins = [
  "http://localhost:5173", // Endereço do seu frontend Vite (verifique a porta no seu terminal)
  "http://127.0.0.1:5173",
  // Adicione aqui a URL do seu frontend em produção quando tiver
  // 'https://seusite.com'
];

// Configuração do CORS
const corsOptions = {
  // A função origin verifica se a origem da requisição está na nossa lista de permitidas
  origin: (origin, callback) => {
    // Permitir requisições sem 'origin' (como apps mobile ou Postman) ou se a origem estiver na lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Não permitido pela política de CORS"));
    }
  },
  credentials: true, // ESSENCIAL para permitir o envio de cookies
};

app.use(cors(corsOptions));

app.use("/uploads", express.static("src/uploads"));
app.use("/auth", authRoutes);
app.use("/home", homeRoutes);
app.use("/api", uploadImageRoutes);

// Rota de teste
app.get("/status", (req, res) => {
  res.status(200).json({
    status: true,
    message:
      "Servidor acordado e operando normalmente! Bem-vindo ao RELAPRO.v1. 🟢",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  cron.schedule("*/15 * * * *", limparRefreshTokensExpirados, {
    scheduled: true,
    timezone: "America/Manaus",
  });

  console.log("Tarefa de limpeza de tokens agendada para ser executada.");
});
