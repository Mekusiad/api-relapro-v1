// src/services/authServices.js

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { loginSchema } from "../validations/schema.js";
import {
  generateCsrfToken,
  generateTokens,
  hashToken,
  refreshExpireAt,
} from "../utils/tokens.js"; // Importe as funções necessárias

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;

export const authService = async (req, res) => {
  // 1. Validação dos dados de entrada com Zod
  const validateLogin = loginSchema.safeParse(req.body);
  if (!validateLogin.success) {
    return res.status(400).json({
      status: false,
      message: "Dados de login inválidos.",
      errors: validateLogin.error.flatten().fieldErrors,
    });
  }

  const { usuario, senha } = validateLogin.data;

  // 2. Busca do funcionário no banco de dados
  const funcionario = await prisma.funcionario.findUnique({
    where: { usuario },
  });

  if (!funcionario) {
    return res
      .status(401)
      .json({ status: false, message: "Utilizador ou senha incorretos." });
  }

  // 3. Verificação da senha com bcrypt
  // A senha que o utilizador enviou vs o hash guardado no banco
  const isMatch = await bcrypt.compare(senha, funcionario.senhaHash);
  if (!isMatch) {
    return res
      .status(401)
      .json({ status: false, message: "Utilizador ou senha incorretos." });
  }

  // 4. Geração de todos os tokens
  // O payload do accessToken contém informações que podemos usar nas rotas protegidas
  const payload = {
    id: funcionario.id,
    matricula: funcionario.matricula,
    nivelAcesso: funcionario.nivelAcesso,
  };
  const { accessToken, refreshToken, csrfToken } = generateTokens(payload);

  // 5. Armazenamento seguro do Refresh Token no banco de dados
  await prisma.refreshToken.create({
    data: {
      hashedToken: hashToken(refreshToken), // Guardamos APENAS o hash
      expiresAt: refreshExpireAt(), // Calcula a data de expiração
      funcionarioId: funcionario.id, // Vincula o token ao funcionário
    },
  });

  // 6. Configuração dos cookies no navegador do cliente
  // httpOnly: true -> O cookie não pode ser acedido por JavaScript no frontend (protege contra XSS)
  // secure: true -> O cookie só será enviado em conexões HTTPS (essencial em produção)
  // sameSite: 'strict' -> Protege contra ataques CSRF
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  }); // 15 minutos
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }); // 7 dias

  // O csrfToken não é httpOnly para que o frontend possa lê-lo e enviá-lo de volta num cabeçalho
  res.cookie("csrfToken", csrfToken, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 15 * 60 * 1000,
  });

  // 7. Retorno da resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Login realizado com sucesso.",
    user: {
      id: funcionario.id,
      nome: funcionario.nome,
      matricula: funcionario.matricula,
      nivelAcesso: funcionario.nivelAcesso,
    },
  });
};

export const refreshTokenService = async (req, res) => {
  // 1. Obter o refreshToken a partir do cookie HttpOnly

  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: false, message: "Refresh token não encontrado." });
  }

  // 2. Fazer o hash do token recebido para o comparar com o da base de dados
  const hashedToken = hashToken(refreshToken);

  // 3. Procurar o token na base de dados e incluir os dados do funcionário associado
  const tokenGuardado = await prisma.refreshToken.findUnique({
    where: { hashedToken },
    include: { funcionario: true },
  });

  // 4. Validar o token
  if (!tokenGuardado) {
    return res
      .status(401)
      .json({ status: false, message: "Refresh token inválido." });
  }
  if (new Date() > new Date(tokenGuardado.expiresAt)) {
    // Se o token expirou, removemo-lo da base de dados por segurança
    await prisma.refreshToken.delete({ where: { id: tokenGuardado.id } });
    return res
      .status(401)
      .json({ status: false, message: "Refresh token expirado." });
  }

  // 5. Se tudo estiver válido, gerar um novo accessToken e um novo csrfToken
  const funcionario = tokenGuardado.funcionario;
  const payload = {
    id: funcionario.id,
    matricula: funcionario.matricula,
    nivelAcesso: funcionario.nivelAcesso,
  };

  const novoAccessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
  const novoCsrfToken = generateCsrfToken();

  // 6. Enviar os novos cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  res.cookie("accessToken", novoAccessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("csrfToken", novoCsrfToken, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 15 * 60 * 1000,
  });

  // 7. Retornar uma resposta de sucesso
  return res
    .status(200)
    .json({ status: true, message: "Token de acesso renovado com sucesso." });
};

export const logoutService = async (req, res) => {
  // 1. Obter o refreshToken a partir do cookie HttpOnly
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Se houver um refreshToken, encontramos e apagamos o seu registo na base de dados
    // para invalidar a sessão do lado do servidor.
    const hashedToken = hashToken(refreshToken);
    await prisma.refreshToken.deleteMany({
      where: { hashedToken },
    });
  }

  // 2. Limpar todos os cookies de autenticação no navegador do utilizador
  // O Express faz isto ao enviar um cabeçalho 'Set-Cookie' com uma data de expiração no passado.
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");

  // 3. Retornar uma resposta de sucesso
  return res
    .status(200)
    .json({ status: true, message: "Logout realizado com sucesso." });
};

export const meService = async (req, res) => {
  const userId = req.user.id;
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: userId },
    // Selecione apenas os campos seguros para enviar ao frontend
    select: {
      id: true,
      nome: true,
      nivelAcesso: true,
      matricula: true,
    },
  });

  if (!funcionario) {
    // Caso raro em que o token é válido, mas o usuário foi deletado
    return res
      .status(404)
      .json({ status: false, message: "Usuário não encontrado." });
  }

  // Retorna os dados do usuário com sucesso
  return res.status(200).json({
    status: true,
    user: funcionario,
  });
};
