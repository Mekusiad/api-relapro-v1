import express from "express";

import {
  protect,
  requireAuth,
  requireCsrf,
} from "../middleware/authMiddleware.js";
import { uploadEmMemoria } from "../middleware/uploadMiddleware.js";
import {
  adicionarFotosEnsaioSchema,
  adicionarFotosSchema,
  atualizarDescricaoFotosSchema,
  excluirFotosSchema,
} from "../validations/schema.js";
import { nivelAcessoMiddleware } from "../middleware/nivelAcessoMiddleware.js";
import { validateGenerico } from "../middleware/homeMiddleware.js";
import {
  adicionarFotosController,
  adicionarFotosEnsaioController,
  atualizarDescricaoFotodaOsController,
  atualizarDescricaoFotodoEnsaioController,
  excluirFotodaOsController,
} from "../controller/fotosController.js";

export const uploadImageRoutes = express.Router();

uploadImageRoutes.use(requireAuth);

uploadImageRoutes.post(
  "/ordens/:numeroOs/upload-photo",
  // 1. Usa o seu middleware 'protect' para validar o accessToken do cookie
  protect,
  // 2. (Opcional, mas recomendado) Usa seu 'requireCsrf' para proteção CSRF
  requireCsrf,
  // 3. Verifica o nível de acesso do usuário que foi decodificado pelo 'protect'
  nivelAcessoMiddleware("ADMIN", "TECNICO"),
  // 4. Valida os parâmetros da URL
  validateGenerico(adicionarFotosSchema),
  // 5. Processa o upload dos arquivos para o Cloudinary
  uploadEmMemoria,
  // 6. Executa a lógica final do controller
  adicionarFotosController
);

uploadImageRoutes.delete(
  "/ordens/:numeroOs/upload-photo/:cloudinaryId",
  // 1. Usa o seu middleware 'protect' para validar o accessToken do cookie
  protect,
  // 2. (Opcional, mas recomendado) Usa seu 'requireCsrf' para proteção CSRF
  requireCsrf,
  // 3. Verifica o nível de acesso do usuário que foi decodificado pelo 'protect'
  nivelAcessoMiddleware("ADMIN", "TECNICO"),
  // 4. Valida os parâmetros da URL
  validateGenerico(excluirFotosSchema),
  // 5. Processa o upload dos arquivos para o Cloudinary
  uploadEmMemoria,
  // 6. Executa a lógica final do controller
  excluirFotodaOsController
);

uploadImageRoutes.patch(
  "/ordens/:numeroOs/upload-photo/:cloudinaryId",
  // 1. Usa o seu middleware 'protect' para validar o accessToken do cookie
  protect,
  // 2. (Opcional, mas recomendado) Usa seu 'requireCsrf' para proteção CSRF
  requireCsrf,
  // 3. Verifica o nível de acesso do usuário que foi decodificado pelo 'protect'
  nivelAcessoMiddleware("ADMIN", "TECNICO"),
  // 4. Valida os parâmetros da URL
  validateGenerico(atualizarDescricaoFotosSchema),
  // 5. Processa o upload dos arquivos para o Cloudinary
  uploadEmMemoria,
  // 6. Executa a lógica final do controller
  atualizarDescricaoFotodaOsController
);

uploadImageRoutes.post(
  "/ordens/:numeroOs/ensaios/:ensaioId/upload-photo",
  // 1. Usa o seu middleware 'protect' para validar o accessToken do cookie
  protect,
  // 2. (Opcional, mas recomendado) Usa seu 'requireCsrf' para proteção CSRF
  requireCsrf,
  // 3. Verifica o nível de acesso do usuário que foi decodificado pelo 'protect'
  nivelAcessoMiddleware("ADMIN", "TECNICO"),
  // 4. Valida os parâmetros da URL
  validateGenerico(adicionarFotosEnsaioSchema),
  // 5. Processa o upload dos arquivos para o Cloudinary
  uploadEmMemoria,
  // 6. Executa a lógica final do controller
  adicionarFotosEnsaioController
);

uploadImageRoutes.patch(
  "/ordens/:numeroOs/ensaios/:ensaioId/upload-photo/:cloudinaryId",
  // 1. Usa o seu middleware 'protect' para validar o accessToken do cookie
  protect,
  // 2. (Opcional, mas recomendado) Usa seu 'requireCsrf' para proteção CSRF
  requireCsrf,
  // 3. Verifica o nível de acesso do usuário que foi decodificado pelo 'protect'
  nivelAcessoMiddleware("ADMIN", "TECNICO"),
  // 4. Valida os parâmetros da URL
  validateGenerico(atualizarDescricaoFotosSchema),
  // 5. Processa o upload dos arquivos para o Cloudinary
  uploadEmMemoria,
  // 6. Executa a lógica final do controller
  atualizarDescricaoFotodoEnsaioController
);

