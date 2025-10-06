export const validateGenerico = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    console.log("Resultado da validação do schema:", result.params);

    if (!result.success) {
      // Extrai os erros formatados do Zod
      const formattedErrors = result.error.format();

      // Tenta encontrar o primeiro erro em 'body', depois 'params', depois 'query'
      const bodyErrors = formattedErrors.body?._errors;
      const paramsErrors = formattedErrors.params?._errors;
      const queryErrors = formattedErrors.query?._errors;

      let firstErrorMessage = "Erro de validação nos dados enviados.";

      // Pega a primeira mensagem de erro de qualquer campo que tenha erro
      if (bodyErrors && bodyErrors.length > 0) {
        firstErrorMessage = bodyErrors[0];
      } else if (paramsErrors && paramsErrors.length > 0) {
        firstErrorMessage = paramsErrors[0];
      } else if (queryErrors && queryErrors.length > 0) {
        firstErrorMessage = queryErrors[0];
      } else {
        // Fallback para erros de campos específicos se não houver erro geral
        const findFirstError = (errors) => {
          for (const key in errors) {
            if (key !== "_errors" && errors[key]?._errors[0]) {
              // Retorna no formato "Campo: Mensagem de erro"
              return `${key}: ${errors[key]._errors[0]}`;
            }
          }
          return null;
        };

        firstErrorMessage =
          findFirstError(formattedErrors.body) ||
          findFirstError(formattedErrors.params) ||
          findFirstError(formattedErrors.query) ||
          firstErrorMessage;
      }

      // --- FIM DA ADAPTAÇÃO ---

      return res.status(400).json({
        status: false,
        // Mensagem principal agora é o primeiro erro encontrado
        message: firstErrorMessage,
        // Mantemos os detalhes completos para depuração, se necessário
        data: formattedErrors,
      });
    }
    console.log("Schema validado.");
    req.validatedData = result.data;
    next();
  };
};
