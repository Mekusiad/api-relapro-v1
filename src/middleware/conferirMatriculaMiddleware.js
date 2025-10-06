export const conferirMatriculaMiddleware = (paramsName = "matricula") => {
  return (req, res, next) => {
    // 1. Pega a matrícula do token (já deve ser uma string)
    const decodedMatricula = req.user?.matricula;

    // 2. Pega a matrícula dos parâmetros da URL (também uma string)
    const paramsMatricula = Number(req.params[paramsName]);

    // Debugging: Verifique no console do backend se os valores estão chegando corretamente

    // 3. Compara as duas strings
    if (
      !decodedMatricula ||
      !paramsMatricula ||
      decodedMatricula !== paramsMatricula
    ) {
      return res.status(403).json({
        status: false,
        message:
          "Acesso negado: a matrícula do utilizador não corresponde à matrícula da rota.",
      });
    }

    console.log("Matrículas correspondem. Acesso permitido.");
    next();
  };
};
