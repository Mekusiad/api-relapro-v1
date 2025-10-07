import { verifyAccessToken } from "../utils/tokens.js";
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token)
    return res.status(401).json({ status: false, message: "Token ausente." });

  const payload = verifyAccessToken(token);

  if (!payload)
    return res.status(401).json({ status: false, message: "Token ausente." });

  req.user = payload;
  console.log("Token analisado. Acesso permitido.");
  next();
};
// CSRF check (double-submit)
export const requireCsrf = (req, res, next) => {
  const csrfHeader = req.header("x-csrf-token");
  const csrfCookie = req.cookies?.csrfToken;
  if (!csrfCookie || !csrfHeader || csrfHeader !== csrfCookie)
    return res.status(403).json({ status: false, message: "CSRF inválido." });
  next();
};
/**
 * Middleware para proteger rotas.
 * Verifica o accessToken presente nos cookies.
 * Se o token for válido, anexa os dados do usuário ao objeto `req`.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Pega o token do cookie 'accessToken'
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. Se não houver token, retorna erro 401 (Não Autorizado)
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Não autorizado, token não encontrado.",
    });
  }

  try {
    // 3. Verifica se o token é válido usando a chave secreta
    // Certifique-se de que a variável de ambiente JWT_SECRET está configurada!
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Anexa o payload decodificado (com id, matricula, etc.) ao objeto `req`
    // para que possa ser usado pelo próximo controller.
    req.user = decoded;

    // 5. Continua para a próxima função (o controller da rota)
    console.log("requireCsrf validado.");
    next();
  } catch (error) {
    // Se a verificação falhar (token expirado, inválido), retorna erro 401
    console.error("Erro na verificação do token:", error.message);
    return res
      .status(401)
      .json({ status: false, message: "Não autorizado, token inválido." });
  }
};
/**
 * Middleware de verificação CSRF (Autorização de Ação).
 * Protege contra ataques de Cross-Site Request Forgery, garantindo que
 * as requisições que alteram dados sejam originadas pela nossa própria aplicação.
 */
export const verifyCsrf = (req, res, next) => {
  // Ignora a verificação para métodos seguros que não alteram o estado do servidor.
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfTokenFromHeader = req.headers["x-csrf-token"];
  const csrfTokenFromCookie = req.cookies?.csrfToken;

  // Verifica se ambos os tokens existem
  if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
    return res
      .status(403)
      .json({ status: false, message: "Token CSRF ausente. Acesso proibido." });
  }

  // Compara os dois tokens
  if (csrfTokenFromHeader !== csrfTokenFromCookie) {
    return res.status(403).json({
      status: false,
      message: "Token CSRF inválido. Acesso proibido.",
    });
  }

  // Se tudo estiver correto, continua para a próxima função.
  next();
};
