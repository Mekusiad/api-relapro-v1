import {
  adicionarFotosEnsaioService,
  adicionarFotosService,
  atualizarDescricaoFotodaOs,
  atualizarDescricaoFotodoEnsaio,
  excluirFotodaOs,
} from "../services/fotosServices.js";
import { handleError } from "../utils/errorHandler.js"; // Importe seu errorHandler

export const adicionarFotosController = async (req, res) => {
  try {
    await adicionarFotosService(req, res);
  } catch (error) {
    // Utiliza seu errorHandler centralizado
    return handleError(res, error, "Ocorreu um erro ao adicionar as fotos.");
  }
};

export const excluirFotodaOsController = async (req, res) => {
  try {
    await excluirFotodaOs(req, res);
  } catch (error) {
    // Utiliza seu errorHandler centralizado
    return handleError(res, error, "Ocorreu um erro ao adicionar as fotos.");
  }
};

export const atualizarDescricaoFotodaOsController = async (req, res) => {
  try {
    await atualizarDescricaoFotodaOs(req, res);
  } catch (error) {
    // Utiliza seu errorHandler centralizado
    return handleError(res, error, "Ocorreu um erro ao adicionar as fotos.");
  }
};

export const adicionarFotosEnsaioController = async (req, res) => {
  try {
    await adicionarFotosEnsaioService(req, res);
  } catch (error) {
    // Utiliza seu errorHandler centralizado
    return handleError(res, error, "Ocorreu um erro ao adicionar as fotos.");
  }
};

export const atualizarDescricaoFotodoEnsaioController = async (req, res) => {
  try {
    await atualizarDescricaoFotodoEnsaio(req, res);
  } catch (error) {
    // Utiliza seu errorHandler centralizado
    return handleError(res, error, "Ocorreu um erro ao adicionar as fotos.");
  }
};
