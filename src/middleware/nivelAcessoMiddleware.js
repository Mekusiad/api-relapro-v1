export const nivelAcessoMiddleware = (...niveisPermitidos) => {
  return (req, res, next) => {
    const nivel = req.user.nivelAcesso?.toString().toUpperCase();

    if (!nivel || !niveisPermitidos.includes(nivel)) {
      return res.status(403).json({
        status: false,
        message: "Você não tem permissão para realizar este tipo de ação.",
      });
    }
    console.log("Nível de acesso verificado. Acesso permitido.")
    next();
  };
};