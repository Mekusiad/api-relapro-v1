export const handleError = (
  res,
  error,
  defaultMessage = "Erro interno do servidor."
) => {
  console.error("ERRO NO BACKEND:", error);

  let errorMessage = defaultMessage;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && error.message) {
    errorMessage = error.message;
  }

  if (error.code && error.code.startsWith("LIMIT_")) {
    errorMessage = `Limite de arquivos excedido: ${error.message}`;
  }

  return res.status(500).json({
    status: false,
    message: errorMessage,
  });
};