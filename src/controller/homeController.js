import { handleError } from "../utils/errorHandler.js";
import {
  cadastrarFuncionario,
  atualizarDadosFuncionario,
  listarFuncionarios,
  listarOrdensDoFuncionario,
  listaFuncionarioPorMatricula,
  cadastrarCliente,
  atualizarDadosCliente,
  deletarCliente,
  listarClientes,
  cadastrarEquipamento,
  atualizarEquipamento,
  deletarEquipamento,
  listarEquipamentos,
  cadastrarSubestacao,
  atualizarSubestacao,
  deletarSubestacao,
  deletarComponente,
  cadastrarComponente,
  atualizarComponente,
  listarComponentes,
  listarComponente,
  cadastrarOrdem,
  listarOrdem,
  cadastrarEnsaio,
  deletarOuCancelarOrdem,
  atualizarOrdem,
  solicitarFinalizacao,
  homeDashboard,
  deletarFuncionario,
  buscarCliente,
  listarOrdens,
  buscarOrdemPorId,
  atualizarEnsaio,
} from "../services/homeServices.js";
import { gerarPDFService } from "../services/pdfServices.js";

//  ------------------------------------------------------------------------------------
// Secção funcionário
// Cadastrar funcionário
export const cadastrarFuncionarioController = async (req, res) => {
  try {
    await cadastrarFuncionario(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar dados funcionário
export const atualizarDadosFuncionarioController = async (req, res) => {
  try {
    await atualizarDadosFuncionario(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar dados funcionário
export const deletarFuncionarioController = async (req, res) => {
  try {
    await deletarFuncionario(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar funcionários
export const listarFuncionariosController = async (req, res) => {
  try {
    await listarFuncionarios(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Lista funcionário por matrícula
export const listaFuncionarioPorMatriculaController = async (req, res) => {
  try {
    await listaFuncionarioPorMatricula(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar ordens do funcionário
export const listarOrdensDoFuncionarioController = async (req, res) => {
  try {
    await listarOrdensDoFuncionario(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar ordem por ID
export const listarOrdemController = async (req, res) => {
  try {
    await listarOrdem(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
//  ------------------------------------------------------------------------------------
// Secção cliente
// Cadastrar cliente
export const cadastrarClienteController = async (req, res) => {
  try {
    await cadastrarCliente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar dados cliente
export const atualizarDadosClienteController = async (req, res) => {
  try {
    await atualizarDadosCliente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar cliente
export const deletarClienteController = async (req, res) => {
  try {
    await deletarCliente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar clientes
export const listarClientesController = async (req, res) => {
  try {
    await listarClientes(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Buscar cliente
export const buscarClienteController = async (req, res) => {
  try {
    await buscarCliente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

//  ------------------------------------------------------------------------------------
// Secção equipamento
// Cadastrar equipamento
export const cadastrarEquipamentoController = async (req, res) => {
  try {
    await cadastrarEquipamento(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar equipamento
export const atualizarEquipamentoController = async (req, res) => {
  try {
    await atualizarEquipamento(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar equipamento
export const deletarEquipamentoController = async (req, res) => {
  try {
    await deletarEquipamento(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar equipamentos
export const listarEquipamentosController = async (req, res) => {
  try {
    await listarEquipamentos(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

//  ------------------------------------------------------------------------------------
// Secção subestação
// Cadastrar subestação
export const cadastrarSubestacaoController = async (req, res) => {
  try {
    await cadastrarSubestacao(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar subestação
export const atualizarSubestacaoController = async (req, res) => {
  try {
    await atualizarSubestacao(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar subestação
export const deletarSubestacaoController = async (req, res) => {
  try {
    await deletarSubestacao(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar subestações
export const listarSubestacoesController = async (req, res) => {
  try {
    await listarSubestacoes(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

// ------------------------------------------------------------------------------------------------------
// Secção Componente
// Cadastrar componente
export const cadastrarComponenteController = async (req, res) => {
  try {
    await cadastrarComponente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar componente
export const atualizarComponenteController = async (req, res) => {
  try {
    await atualizarComponente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar componente
export const deletarComponenteController = async (req, res) => {
  try {
    await deletarComponente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar componentes
export const listarComponentesController = async (req, res) => {
  try {
    await listarComponentes(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Listar componente
export const listarComponenteController = async (req, res) => {
  try {
    await listarComponente(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

// -----------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço
// Cadastrar ordem de serviço
export const cadastrarOrdemController = async (req, res) => {
  try {
    await cadastrarOrdem(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar dados ordem de serviço
export const atualizarOrdemController = async (req, res) => {
  try {
    await atualizarOrdem(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar ou cancelar ordem de serviço
export const deletarOuCancelarOrdemController = async (req, res) => {
  try {
    await deletarOuCancelarOrdem(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

export const listarOrdensController = async (req, res) => {
  try {
    await listarOrdens(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

export const buscarOrdemPorIdController = async (req, res) => {
  try {
    await buscarOrdemPorId(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

export const gerarDadosPDFController = async (req, res) => {
  try {
    await gerarPDFService(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// ------------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço - Fluxo de Finalização
// Etapa de solicitar a revisão
export const solicitarFinalizacaoController = async (req, res) => {
  try {
    await solicitarFinalizacao(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Etapa de revisão
export const revisarAdmController = async (req, res) => {
  try {
    await revisarAdm(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Etapa final - aprovação
export const aprovarFinalController = async (req, res) => {
  try {
    await aprovarFinal(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

// -------------------------------------------------------------------------------------------------------
// Secção Ensaio
// Cadastrar ensaio
export const cadastrarEnsaioController = async (req, res) => {
  try {
    await cadastrarEnsaio(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Atualizar ensaio existente
export const atualizarEnsaioController = async (req, res) => {
  try {
    await atualizarEnsaio(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
// Deletar ensaio
export const deletarEnsaioController = async (req, res) => {
  try {
    await deletarEnsaio(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

// Seção home #dashboard
export const homeDashboardController = async (req, res) => {
  try {
    await homeDashboard(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};

//  ------------------------------------------------------------------------------------
// Secção Logs
// Listar logs
export const listarLogsController = async (req, res) => {
  try {
    await listarLogs(req, res);
  } catch (error) {
    return handleError(res, error, error.message);
  }
};
