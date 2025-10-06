import express from "express";

import { conferirMatriculaMiddleware } from "../middleware/conferirMatriculaMiddleware.js";
import { nivelAcessoMiddleware } from "../middleware/nivelAcessoMiddleware.js";
import { validateGenerico } from "../middleware/homeMiddleware.js";

import {
  cadastrarFuncionarioController,
  atualizarDadosFuncionarioController,
  deletarFuncionarioController,
  listarFuncionariosController,
  listaFuncionarioPorMatriculaController,
  listarOrdensDoFuncionarioController,
  cadastrarClienteController,
  atualizarDadosClienteController,
  deletarClienteController,
  listarClientesController,
  cadastrarEquipamentoController,
  atualizarEquipamentoController,
  deletarEquipamentoController,
  listarEquipamentosController,
  listarLogsController,
  cadastrarSubestacaoController,
  atualizarSubestacaoController,
  deletarSubestacaoController,
  listarSubestacoesController,
  cadastrarComponenteController,
  atualizarComponenteController,
  deletarComponenteController,
  listarComponenteController,
  listarComponentesController,
  cadastrarOrdemController,
  atualizarOrdemController,
  deletarOuCancelarOrdemController,
  listarOrdemController,
  cadastrarEnsaioController,
  atualizarEnsaioController,
  deletarEnsaioController,
  revisarAdmController,
  aprovarFinalController,
  homeDashboardController,
  solicitarFinalizacaoController,
  buscarClienteController,
  listarOrdensController,
  buscarOrdemPorIdController,
  gerarDadosPDFController,
} from "../controller/homeController.js";

import {
  cadastrarFuncionarioSchema,
  atualizarDadosFuncionarioSchema,
  deletarFuncionarioSchema,
  listarFuncionariosSchema,
  buscaFuncionarioSchema,
  cadastrarClienteSchema,
  atualizarDadosClienteSchema,
  deletarClienteSchema,
  listarClientesSchema,
  cadastrarEquipamentoSchema,
  atualizarEquipamentoSchema,
  deletarEquipamentoSchema,
  listarEquipamentosSchema,
  cadastrarSubestacaoSchema,
  atualizarSubestacaoSchema,
  deletarSubestacaoSchema,
  listarSubestacoesSchema,
  cadastrarComponenteSchema,
  atualizarComponenteSchema,
  deletarComponenteSchema,
  listarComponentesSchema,
  listarcomponenteSchema,
  listarLogsSchema,
  cadastrarOrdemSchema,
  atualizarOrdemSchema,
  deletarOuCancelarOrdemSchema,
  listarOrdensSchema,
  listarOrdemSchema,
  cadastrarEnsaioSchema,
  atualizarEnsaioSchema,
  deletarEnsaioSchema,
  revisarAdmSchema,
  aprovarFinalSchema,
  dashBoardSchema,
  solicitarFinalizacaoSchema,
  buscarClienteSchema,
  listarOrdensSchemaPage,
} from "../validations/schema.js";
import {
  protect,
  requireAuth,
  requireCsrf,
} from "../middleware/authMiddleware.js";

export const homeRoutes = express.Router({ mergeParams: true });

homeRoutes.use(requireAuth);

// ------------------------------------------------------------------------------------------------------
// Seção tela inicial #dashboard
homeRoutes.get(
  "/home/:matricula/dashboard",
  validateGenerico(dashBoardSchema),
  homeDashboardController
);

// -------------------------------------------------------------------------------------------------------
// Secção Funcionário
// Cadastrar funcionário
homeRoutes.post(
  "/:matricula/funcionarios",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE"),
  validateGenerico(cadastrarFuncionarioSchema),
  cadastrarFuncionarioController
);
// Atualizar dados do funcionário
homeRoutes.put(
  "/:matricula/funcionarios/:outraMatricula",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(atualizarDadosFuncionarioSchema),
  atualizarDadosFuncionarioController
);
// Deletar funcionário
homeRoutes.delete(
  "/:matricula/funcionarios/:outraMatricula",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(deletarFuncionarioSchema),
  deletarFuncionarioController
);
// Listar funcionários
homeRoutes.get(
  "/funcionarios",
  protect,
  // conferirMatriculaMiddleware("matricula"),
  // nivelAcessoMiddleware("ADMIN","GERENTE","ENGENHEIRO"),
  validateGenerico(listarFuncionariosSchema),
  listarFuncionariosController
);
// Lista funcionário por matrícula
homeRoutes.get(
  "/home/:matricula/funcionarios/:outraMatricula",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(buscaFuncionarioSchema),
  listaFuncionarioPorMatriculaController
);
// Listar ordens do funcionário
homeRoutes.get(
  "/home/:matricula/ordens",
  conferirMatriculaMiddleware("matricula"),
  // nivelAcessoMiddleware("ADMIN","GERENTE","ENGENHEIRO"),
  validateGenerico(listarOrdensSchema),
  listarOrdensDoFuncionarioController
);
// Listar uma Ordem de Serviço específica por ID
homeRoutes.get(
  "/home/:matricula/ordens/:ordemId",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(listarOrdemSchema),
  listarOrdemController
);

// -------------------------------------------------------------------------------------------------------
// Secção Cliente
// Cadastrar cliente
homeRoutes.post(
  "/:matricula/clientes",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(cadastrarClienteSchema),
  cadastrarClienteController
);
// Atualizar dados cliente
homeRoutes.put(
  "/:matricula/clientes/:clienteId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(atualizarDadosClienteSchema),
  atualizarDadosClienteController
);
// Deletar cliente
homeRoutes.delete(
  "/:matricula/clientes/:clienteId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(deletarClienteSchema),
  deletarClienteController
);
// Listar clientes
homeRoutes.get(
  "/:matricula/clientes",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(listarClientesSchema),
  listarClientesController
);
// Buscar cliente
homeRoutes.get(
  "/:matricula/clientes/:clienteId",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(buscarClienteSchema),
  buscarClienteController
);

// -------------------------------------------------------------------------------------------------------
// Secção Equipamento
// Cadastrar equipamento
homeRoutes.post(
  "/:matricula/equipamentos",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(cadastrarEquipamentoSchema),
  cadastrarEquipamentoController
);
// Atualizar equipamento
homeRoutes.put(
  "/:matricula/equipamentos/:equipamentoId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(atualizarEquipamentoSchema),
  atualizarEquipamentoController
);
// Deletar equipamento
homeRoutes.delete(
  "/:matricula/equipamentos/:equipamentoId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(deletarEquipamentoSchema),
  deletarEquipamentoController
);
// Listar equipamentos
homeRoutes.get(
  "/:matricula/equipamentos",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(listarEquipamentosSchema),
  listarEquipamentosController
);

// Secção subestação -------------------------------------------------------------------------------------
// Cadastrar subestação para um cliente existente
homeRoutes.post(
  "/home/:matricula/clientes/:clienteId/subestacoes",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(cadastrarSubestacaoSchema),
  cadastrarSubestacaoController
);
// Atualizar dados da subestação
homeRoutes.put(
  "/home/:matricula/clientes/:clienteId/subestacoes/:subestacaoId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(atualizarSubestacaoSchema),
  atualizarSubestacaoController
);
// Deletar subestação
homeRoutes.delete(
  "/home/:matricula/clientes/:clienteId/subestacoes/:subestacaoId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(deletarSubestacaoSchema),
  deletarSubestacaoController
);
// Listar subestações
homeRoutes.get(
  "/home/:matricula/clientes/:clienteId/subestacoes",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(listarSubestacoesSchema),
  listarSubestacoesController
);

// -------------------------------------------------------------------------------------------------------
// Secção Componente
// Cadastrar componente para uma subestação existente
homeRoutes.post(
  "/home/:matricula/subestacoes/:subestacaoId/componentes",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(cadastrarComponenteSchema),
  cadastrarComponenteController
);
// Atualizar dados do componente
homeRoutes.put(
  "/:matricula/subestacoes/:subestacaoId/componentes/:componenteId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(atualizarComponenteSchema),
  atualizarComponenteController
);
// Deletar componente
homeRoutes.delete(
  "/home/:matricula/subestacoes/:subestacaoId/componentes/:componenteId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(deletarComponenteSchema),
  deletarComponenteController
);
// Listar componentes
homeRoutes.get(
  "/home/:matricula/componentes",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(listarComponentesSchema),
  listarComponentesController
);
// Listar um componente específico por ID
homeRoutes.get(
  "/home/:matricula/componentes/:componenteId",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(listarcomponenteSchema),
  listarComponenteController
);

// -------------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço
// Cadastrar uma nova Ordem de Serviço
homeRoutes.post(
  "/:matricula/ordens",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(cadastrarOrdemSchema),
  cadastrarOrdemController
);
// Atualizar dados ordem de serviço
homeRoutes.put(
  "/:matricula/ordens/:ordemId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(atualizarOrdemSchema),
  atualizarOrdemController
);
// Deletar (ADMIN) ou Cancelar (outros) uma Ordem de Serviço
homeRoutes.delete(
  "/:matricula/ordens/:ordemId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO"),
  validateGenerico(deletarOuCancelarOrdemSchema),
  deletarOuCancelarOrdemController
);
// Listar ordens de serviço com filtros
homeRoutes.get(
  "/:matricula/ordens", // Rota GET para listar
  protect, // Seu middleware que já verifica o accessToken
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware(
    "ADMIN",
    "GERENTE",
    "ENGENHEIRO",
    "SUPERVISOR",
    "TECNICO"
  ), // Defina os níveis que podem ver
  validateGenerico(listarOrdensSchemaPage), // Usa o novo schema de validação
  listarOrdensController // Usa o novo controller
);
// Listar ordens de serviço com filtros
homeRoutes.get(
  "/:matricula/ordens/:ordemId", // Detalha uma OS
  protect, // Seu middleware que já verifica o accessToken
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware(
    "ADMIN",
    "GERENTE",
    "ENGENHEIRO",
    "SUPERVISOR",
    "TECNICO"
  ), // Defina os níveis que podem ver
  validateGenerico(deletarOuCancelarOrdemSchema), // Usa o novo schema de validação
  buscarOrdemPorIdController
);

// Buscar ordem para PDF
homeRoutes.get(
  "/:matricula/ordens/:ordemId/pdf", // Detalha uma OS
  protect, // Seu middleware que já verifica o accessToken
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware(
    "ADMIN",
    "GERENTE",
    "ENGENHEIRO",
  ), // Defina os níveis que podem ver
  validateGenerico(deletarOuCancelarOrdemSchema), // Usa o novo schema de validação
  gerarDadosPDFController
);

// -------------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço - Fluxo de Finalização
// Etapa 1: Supervisor solicita a finalização
homeRoutes.post(
  "/:matricula/ordens/:ordemId/solicitar-finalizacao",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("SUPERVISOR", "GERENTE", "ADMIN"), // Atores principais
  validateGenerico(solicitarFinalizacaoSchema),
  solicitarFinalizacaoController
);
// Etapa 2: ADM revisa e aprova para o engenheiro
homeRoutes.post(
  "/:matricula/ordens/:ordemId/revisar-adm",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN"), // Apenas ADMIN pode executar esta ação
  validateGenerico(revisarAdmSchema),
  revisarAdmController
);
// Etapa 3: Engenheiro dá a aprovação final e encerra a OS
homeRoutes.post(
  "/:matricula/ordens/:ordemId/aprovar-final",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ENGENHEIRO", "GERENTE", "ADMIN"), // Atores com permissão para finalizar
  validateGenerico(aprovarFinalSchema),
  aprovarFinalController
);

// -------------------------------------------------------------------------------------------------------
// Secção Ensaio
// Cadastrar um novo Ensaio para um componente no escopo de uma OS
homeRoutes.post(
  "/:matricula/ordens/:numeroOs/ensaios",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware(
    "ADMIN",
    "GERENTE",
    "ENGENHEIRO",
    "SUPERVISOR",
    "TECNICO"
  ),
  validateGenerico(cadastrarEnsaioSchema),
  cadastrarEnsaioController
);
// Atualizar um ensaio existente
homeRoutes.put(
  "/:matricula/ordens/:numeroOs/ensaios/:ensaioId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN", "GERENTE", "ENGENHEIRO", "TECNICO"),
  validateGenerico(atualizarEnsaioSchema),
  atualizarEnsaioController
);
// Deletar um ensaio existente (Apenas ADMIN)
homeRoutes.delete(
  "/home/:matricula/ensaios/:ensaioId",
  conferirMatriculaMiddleware("matricula"),
  requireCsrf,
  nivelAcessoMiddleware("ADMIN"),
  validateGenerico(deletarEnsaioSchema),
  deletarEnsaioController
);

// -------------------------------------------------------------------------------------------------------
// Secção Logs de Atividade
// Listar logs com filtros
homeRoutes.get(
  "/home/:matricula/logs",
  conferirMatriculaMiddleware("matricula"),
  nivelAcessoMiddleware("ADMIN"),
  validateGenerico(listarLogsSchema),
  listarLogsController
);
