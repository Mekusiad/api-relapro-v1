import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { gerarUsuarioAutomatico } from "../utils/utils.js";

const reestruturarClienteParaFrontend = (cliente) => {
  if (!cliente || !cliente.subestacoes) {
    return cliente;
  }

  const infoFields = [
    "tag",
    "identificacao",
    "localizacao",
    "modelo",
    "fabricante",
    "numeroSerie",
    "quantidade",
    "meioIsolante",
    "anoFabricacao",
    "massaTotal",
    "potencia",
    "tensao",
    "correnteNominal",
    "correntePrimario",
    "correnteSecundario",
    "tensaoNominal",
    "tensaoPrimario",
    "tensaoSecundario",
    "volumeOleoIsolante",
    "temperaturaEnsaio",
    "impedancia",
    "frequencia",
    "umidadeRelativaAr",
    "exatidao",
    "curtoCircuito",
    "circuito",
    "pressao",
    "secaoCabo",
    "tipoTensaoAt",
    "tipoTensaoBt",
    "tipoPressao",
  ];

  const subestacoesReestruturadas = cliente.subestacoes.map((sub) => ({
    ...sub,
    componentes:
      sub.componentes?.map((comp) => {
        const infoObject = {};
        const componentCore = { ...comp };

        infoFields.forEach((field) => {
          if (componentCore.hasOwnProperty(field)) {
            infoObject[field] = componentCore[field];
            delete componentCore[field];
          }
        });

        return { ...componentCore, info: infoObject };
      }) || [],
  }));

  return { ...cliente, subestacoes: subestacoesReestruturadas };
};

const ordemComponentes = [
  "MALHA",
  "RESISTOR",
  "PARARAIO",
  "CABOMUFLA",
  "CHAVE_SECCIONADORA_ALTA",
  "CHAVE_SECCIONADORA_MEDIA",
  "CHAVE_SECCIONADORA_BAIXA",
  "DISJUNTOR_ALTA",
  "DISJUNTOR_MEDIA",
  "TRAFO_ALTA",
  "TRAFO_POTENCIAL",
  "TRAFO_POTENCIA",
  "TRAFO_CORRENTE",
  "TRAFO_MEDIA",
  "BATERIA",
];

const prisma = new PrismaClient();

/**
 * Helper function para verificar se um ID é um UUID válido.
 * Itens novos do frontend (ex: 'sub-123...') não passarão nesta verificação.
 * @param {string} id O ID a ser verificado.
 * @returns {boolean}
 */
const isUUID = (id) => {
  if (typeof id !== "string") return false;
  // Expressão regular que valida o formato UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// -------------------------------------------------------------------------------------------------------
// Secção funcionário
// Cadastrar funcionário
/**
 * Cadastra os dados de um funcionário e registra a atividade.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarFuncionario = async (req, res) => {
  // Use a desestruturação para obter os dados validados
  const { nome, matricula, cargo, senha, nivelAcesso, usuario, admissao } =
    req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  // 1. Verifica se a matrícula já existe no banco de dados
  const matriculaExist = await prisma.funcionario.findUnique({
    where: { matricula: matricula },
  });
  if (matriculaExist) {
    return res.status(400).json({
      status: false,
      message: "Matrícula existente. Por favor, utilize outra.",
    });
  }

  // 2. Lógica para gerar ou usar o nome de usuário fornecido
  // Se o usuário não fornecer um nome de usuário, um será gerado automaticamente
  const novoUsuario = usuario || gerarUsuarioAutomatico(nome);

  // 3. Verifica se o nome de usuário gerado ou fornecido já existe
  const usuarioExist = await prisma.funcionario.findUnique({
    where: { usuario: novoUsuario },
  });
  if (usuarioExist) {
    return res.status(400).json({
      status: false,
      message:
        "Nome de usuário existente. Por favor, tente um nome de usuário diferente ou gere um novo.",
    });
  }

  // 4. Gera o hash da senha antes de salvá-la
  const saltRounds = 10;
  const senhaHash = await bcrypt.hash(senha, saltRounds);

  // 5. Cria o novo funcionário com os dados validados
  const dadosCriados = await prisma.funcionario.create({
    data: {
      nome: nome.toUpperCase(),
      usuario: novoUsuario,
      matricula: matricula,
      cargo: cargo.toUpperCase(),
      admissao: admissao || new Date(),
      senhaHash: senhaHash,
      nivelAcesso: nivelAcesso || "TECNICO",
    },
  });

  // 6. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "CRIAR",
      entidade: "funcionario",
      // 'dadosAfetados' armazena um snapshot dos dados após a atualização
      dadosAfetados: dadosCriados,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 7. Retorna uma resposta de sucesso
  return res.status(201).json({
    status: true, // Corrigido: status deve ser 'true' para sucesso
    message: "Funcionário cadastrado com sucesso.",
  });
};
// Atualizar dados funcionário
/**
 * Atualiza os dados de um funcionário e registra a atividade no log.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarDadosFuncionario = async (req, res) => {
  const { outraMatricula } = req.validatedData.params;
  const matriculaUsuarioLogado = req.user.matricula;
  const data = req.validatedData.body;

  // 1. Verifica se o funcionário existe
  const funcionario = await prisma.funcionario.findUnique({
    where: { matricula: outraMatricula },
  });

  if (data.matricula && data.matricula !== funcionario.matricula)
    return res.status(403).json({
      status: false,
      message:
        "Acesso negado, não é permitido alterar matrícula uma vez cadastrado.",
    });

  if (!funcionario) {
    return res.status(404).json({
      status: false,
      message: "Funcionário não encontrado.",
    });
  }

  // 2. Lógica para hash da senha, se ela estiver presente na requisição
  if (data.senha) {
    const saltRounds = 10;
    data.senhaHash = await bcrypt.hash(data.senha, saltRounds);
    // Remove o campo 'senha' do objeto de dados para evitar erro no Prisma
    delete data.senha;
  }

  // 3. Atualiza os dados do funcionário
  const dadosAtualizados = await prisma.funcionario.update({
    where: { matricula: outraMatricula },
    data,
  });

  // 4. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "ATUALIZAR",
      entidade: "funcionario",
      // 'dadosAfetados' armazena um snapshot dos dados após a atualização
      dadosAfetados: dadosAtualizados,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 5. Retorna uma resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Dados do funcionário atualizados com sucesso.",
  });
};
// Deletar funcionário
/**
 * Exclui um funcionário e registra a atividade no log.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarFuncionario = async (req, res) => {
  const { outraMatricula } = req.validatedData.params;

  const matriculaUsuarioLogado = req.user.matricula;

  // 1. Verifica se o usuário está tentando excluir a si mesmo.
  if (outraMatricula === matriculaUsuarioLogado) {
    return res.status(401).json({
      status: false,
      message: "Acesso negado. Não é permitido excluir a si mesmo.",
    });
  }

  // 2. Encontra o funcionário para obter um snapshot dos dados antes de excluir.
  const funcionarioParaExcluir = await prisma.funcionario.findUnique({
    where: { matricula: outraMatricula },
  });

  if (!funcionarioParaExcluir) {
    return res.status(404).json({
      status: false,
      message: "Funcionário não encontrado.",
    });
  }

  // 3. Executa a exclusão do funcionário.
  await prisma.funcionario.delete({
    where: { matricula: outraMatricula },
  });

  // 4. Registra a atividade no log após a exclusão bem-sucedida.
  await prisma.logAtividade.create({
    data: {
      acao: "EXCLUIR",
      entidade: "funcionario",
      // Armazena um snapshot dos dados do funcionário que foi excluído
      dadosAfetados: funcionarioParaExcluir,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 5. Retorna uma resposta de sucesso.
  return res.status(200).json({
    status: true,
    message: "Funcionário excluído com sucesso.",
  });
};
// Listar funcionários
/**
 * Lista funcionários com suporte a filtros e paginação.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarFuncionarios = async (req, res) => {
  // Acessa os dados já validados e tipados, fornecidos pelo middleware
  const { page, limit, nome, matricula, cargo, nivelAcesso } =
    req.validatedData.query;

  // Constrói o objeto 'where' dinamicamente com base nos filtros
  const where = {
    ...(nome && {
      nome: {
        contains: nome,
        // mode: 'insensitive'
      },
    }),
    ...(matricula && { matricula: matricula }),
    ...(cargo && {
      cargo: {
        contains: cargo,
        //  mode: 'insensitive'
      },
    }),
    ...(nivelAcesso && { nivelAcesso: nivelAcesso }),
  };

  // 1. Busca os funcionários no banco de dados com paginação e filtros
  const funcionarios = await prisma.funcionario.findMany({
    where,
    orderBy: {
      nome: "asc",
    },
    take: limit,
    skip: (page - 1) * limit,
    select: {
      id: true,
      nome: true,
      usuario: true,
      matricula: true,
      cargo: true,
      nivelAcesso: true,
      createdAt: true,
    },
  });

  // 2. Conta o total de funcionários para a paginação
  const totalFuncionarios = await prisma.funcionario.count({ where });
  const totalPages = Math.ceil(totalFuncionarios / limit);

  // 3. Retorna a resposta de sucesso
  return res.status(200).json({
    status: true,
    mensagem: "Lista de funcionários.",
    data: {
      currentPage: page,
      totalPages: totalPages,
      totalFuncionarios: totalFuncionarios,
      funcionarios: funcionarios,
    },
  });
};
// Listar funcionário por matrícula
/**
 * Busca um funcionário por matrícula, garantindo que dados sensíveis não sejam retornados.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listaFuncionarioPorMatricula = async (req, res) => {
  // A matrícula do funcionário a ser buscado (convertida para o tipo correto)
  const { outraMatricula } = req.validatedData.params;

  // 1. Busca o funcionário usando findUnique para campos únicos
  // A consulta usa o método 'select' para garantir que a senha nunca seja retornada
  const funcionario = await prisma.funcionario.findUnique({
    where: { matricula: outraMatricula },
    select: {
      id: true,
      nome: true,
      usuario: true,
      matricula: true,
      cargo: true,
      nivelAcesso: true,
      createdAt: true,
      updatedAt: true,
      admissao: true,
      demissao: true,
    },
  });

  if (!funcionario) {
    return res.status(404).json({
      status: false,
      message: "Funcionário não encontrado ou não existe.",
    });
  }

  // 2. Retorna a resposta com os dados do funcionário
  return res.status(200).json({
    status: true,
    message: "Funcionário localizado com sucesso.",
    data: funcionario,
  });
};
// Listar ordens do funcionário
/**
 * Lista as ordens de serviço com filtros avançados e paginação.
 * A lógica de permissão (ADMIN vs outros utilizadores) é mantida.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarOrdensDoFuncionario = async (req, res) => {
  // 1. Aceder aos dados já validados da query
  const {
    page,
    limit,
    status,
    numeroOs,
    cliente,
    engenheiroMatricula,
    supervisorMatricula,
    dataInicio,
    dataFim,
  } = req.validatedData.query;

  // 2. Obter dados do utilizador logado
  const { nivelAcesso, matricula: matriculaUsuario } = req.user;

  // 3. Construir o objeto 'where' dinamicamente com todos os filtros
  const where = {
    // Filtros antigos
    ...(status && { status: status }),
    ...(numeroOs && {
      numeroOs: {
        contains: numeroOs,
        //  mode: 'insensitive'
      },
    }),
    ...(cliente && {
      cliente: {
        nome: {
          contains: cliente,
          // mode: 'insensitive'
        },
      },
    }),

    // --- NOVOS FILTROS ---
    ...(engenheiroMatricula && {
      engenheiro: { matricula: engenheiroMatricula },
    }),
    ...(supervisorMatricula && {
      supervisor: { matricula: supervisorMatricula },
    }),

    // Lógica para filtro de período
    ...(dataInicio && { previsaoInicio: { gte: new Date(dataInicio) } }), // gte: Greater Than or Equal
    ...(dataFim && { previsaoTermino: { lte: new Date(dataFim) } }), // lte: Less Than or Equal

    // Filtro de segurança crucial baseado no nível de acesso
    ...(nivelAcesso !== "ADMIN" && {
      OR: [
        { supervisor: { matricula: matriculaUsuario } },
        { engenheiro: { matricula: matriculaUsuario } },
        { tecnicos: { some: { matricula: matriculaUsuario } } },
      ],
    }),
  };

  // 4. Buscar as ordens de serviço (o resto da função permanece igual)
  const [ordens, totalOrdens] = await Promise.all([
    prisma.ordem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        tecnicos: { select: { nome: true, matricula: true } },
        supervisor: { select: { nome: true, matricula: true } },
        engenheiro: { select: { nome: true, matricula: true } },
        cliente: { select: { nome: true } },
      },
    }),
    prisma.ordem.count({ where }),
  ]);

  const totalPages = Math.ceil(totalOrdens / limit);

  // 5. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message:
      ordens.length > 0
        ? "Ordens de serviço localizadas."
        : "Nenhum dado encontrado com base nos filtros usados.",
    data: { currentPage: page, totalPages, totalOrdens, ordens },
  });
};

// -------------------------------------------------------------------------------------------------------
// Secção cliente
/**
 * Cadastra um novo cliente, suas subestações e componentes associados, registra em log.
 * A validação dos dados é gerenciada pelo middleware 'validateGenerico'.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarCliente = async (req, res) => {
  const { subestacoes, ...clienteData } = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  const subestacoesArray = Array.isArray(subestacoes)
    ? subestacoes
    : subestacoes
    ? [subestacoes]
    : [];

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Cria o cliente (sem alterações aqui)
      const novoCliente = await prisma.cliente.create({ data: clienteData });

      // 2. Itera sobre as subestações (sem alterações aqui)
      const subestacoesCriadas = await Promise.all(
        subestacoesArray.map(async (subestacao) => {
          const {
            id: subestacaoId,
            componentes,
            ...subestacaoData
          } = subestacao;

          const novaSubestacao = await prisma.subestacao.create({
            data: {
              ...subestacaoData,
              clienteId: novoCliente.id,
            },
          });

          // 3. AJUSTE PRINCIPAL AQUI: Itera sobre os componentes e achata a estrutura
          const componentesCriados = componentes
            ? await Promise.all(
                componentes.map((componente) => {
                  // Separa o objeto 'info' e o resto dos dados do componente
                  const {
                    id: componenteId,
                    info,
                    ...componenteRest
                  } = componente;

                  // Combina os dados do componente com os dados de dentro do 'info'
                  const dadosFinaisDoComponente = {
                    ...componenteRest, // Contém nomeEquipamento, tipo
                    ...info, // Contém localizacao, tag, fabricante, etc.
                  };

                  // Cria o componente com a estrutura de dados correta e plana
                  return prisma.componente.create({
                    data: {
                      ...dadosFinaisDoComponente,
                      subestacaoId: novaSubestacao.id,
                    },
                  });
                })
              )
            : [];

          return { ...novaSubestacao, componentes: componentesCriados };
        })
      );

      // 4. Registra a atividade no log (sem alterações aqui)
      const dadosAfetados = {
        cliente: novoCliente,
        subestacoes: subestacoesCriadas,
      };
      await prisma.logAtividade.create({
        data: {
          acao: "CRIAR",
          entidade: "cliente",
          dadosAfetados: dadosAfetados,
          feitoPor: matriculaUsuarioLogado,
        },
      });

      return { novoCliente, subestacoesCriadas };
    });

    // Retorna a resposta de sucesso
    return res.status(201).json({
      status: true,
      message: "Cliente, subestações e componentes cadastrados com sucesso.",
      data: result,
    });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    // Adiciona um tratamento de erro para retornar uma resposta clara
    return res.status(500).json({
      status: false,
      message: "Ocorreu um erro interno ao cadastrar o cliente.",
      error: error.message, // Opcional: para debug
    });
  }
};
/**
 * Atualiza os dados de um cliente existente e registra a atividade no log.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarDadosCliente = async (req, res) => {
  const { clienteId } = req.validatedData.params;
  const { subestacoes = [], ...clienteData } = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  const result = await prisma.$transaction(async (tx) => {
    // 1. ATUALIZA os dados principais do cliente (sem parseInt)
    await tx.cliente.update({
      where: { id: clienteId },
      data: clienteData,
    });

    // --- SINCRONIZAÇÃO DE SUBESTAÇÕES ---

    const subestacoesAtuaisNoDB = await tx.subestacao.findMany({
      where: { clienteId: clienteId },
      select: { id: true },
    });
    const idsAtuaisNoDB = subestacoesAtuaisNoDB.map((s) => s.id);
    const subestacoesFrontendIds = subestacoes
      .map((sub) => sub.id)
      .filter(isUUID);
    const idsParaDeletar = idsAtuaisNoDB.filter(
      (id) => !subestacoesFrontendIds.includes(id)
    );

    // 2. DELETA subestações que foram removidas no frontend
    if (idsParaDeletar.length > 0) {
      await tx.subestacao.deleteMany({
        where: { id: { in: idsParaDeletar } },
      });
    }

    // 3. CRIA ou ATUALIZA as subestações e seus componentes
    for (const subestacao of subestacoes) {
      const { componentes = [], ...subestacaoData } = subestacao;
      const dadosSubestacao = { ...subestacaoData, clienteId: clienteId };
      delete dadosSubestacao.id; // Remove ID para não interferir no create/update

      let subestacaoProcessada;
      if (isUUID(subestacao.id)) {
        // Se tem UUID, ATUALIZA
        subestacaoProcessada = await tx.subestacao.update({
          where: { id: subestacao.id },
          data: dadosSubestacao,
        });
      } else {
        // Se não tem UUID, CRIA
        subestacaoProcessada = await tx.subestacao.create({
          data: dadosSubestacao,
        });
      }

      // --- SINCRONIZAÇÃO DE COMPONENTES para a subestação atual ---
      const componentesAtuaisDaSub = await tx.componente.findMany({
        where: { subestacaoId: subestacaoProcessada.id },
        select: { id: true },
      });
      const idsCompAtuais = componentesAtuaisDaSub.map((c) => c.id);
      const idsCompFrontend = componentes.map((c) => c.id).filter(isUUID);
      const idsCompParaDeletar = idsCompAtuais.filter(
        (id) => !idsCompFrontend.includes(id)
      );

      if (idsCompParaDeletar.length > 0) {
        await tx.componente.deleteMany({
          where: { id: { in: idsCompParaDeletar } },
        });
      }

      for (const comp of componentes) {
        const { id, info, ...compRest } = comp;
        const dadosComponente = {
          ...compRest,
          ...info,
          subestacaoId: subestacaoProcessada.id,
        };

        if (isUUID(id)) {
          await tx.componente.update({
            where: { id: id },
            data: dadosComponente,
          });
        } else {
          await tx.componente.create({ data: dadosComponente });
        }
      }
    }

    // Busca o cliente completo novamente para o log
    const dadosAfetados = await tx.cliente.findUnique({
      where: { id: clienteId },
      include: { subestacoes: { include: { componentes: true } } },
    });

    // 4. Registra a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "cliente",
        dadosAfetados: dadosAfetados,
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return dadosAfetados;
  });

  return res.status(200).json({
    status: true,
    message: "Cliente atualizado com sucesso.",
    data: result,
  });
};
/**
 * Deleta um cliente do banco de dados e registra a atividade no log.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarCliente = async (req, res) => {
  // 1. Obtém o ID do cliente dos parâmetros da URL já validados e tipados
  const { clienteId } = req.validatedData.params;

  // 2. Obtém a matrícula do usuário logado que está realizando a ação

  const matriculaUsuarioLogado = req.user.matricula;

  // 3. Encontra o cliente para obter um snapshot dos dados antes de deletá-lo
  const clienteParaDeletar = await prisma.cliente.findUnique({
    where: { id: clienteId },
  });

  if (!clienteParaDeletar) {
    return res.status(404).json({
      status: false,
      message: "Cliente não encontrado.",
    });
  }

  // 4. Executa a deleção do cliente
  await prisma.cliente.delete({
    where: { id: clienteId },
  });

  // 5. Registra a atividade no log após a deleção
  await prisma.logAtividade.create({
    data: {
      acao: "DELETAR",
      entidade: "cliente",
      // Armazena um snapshot dos dados do cliente que foi deletado
      dadosAfetados: clienteParaDeletar,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 6. Retorna uma resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Cliente excluído com sucesso.",
  });
};
/**
 * Lista todos os clientes, com suporte a paginação e filtros opcionais.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarClientes = async (req, res) => {
  const { page, nome, cnpj } = req.query;

  const limit = 10;
  const skip = page ? (parseInt(page) - 1) * limit : 0;

  const where = {
    ...(nome && {
      nome: {
        contains: nome,
      },
    }),
    ...(cnpj && { cnpj: parseInt(cnpj) }),
  };

  // Busca clientes + subestações + componentes
  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { nome: "asc" },
    ...(page && { take: limit, skip }),
    select: {
      id: true,
      cnpj: true,
      contato: true,
      nome: true,
      nomeResponsavel: true,
      email: true,
      rua: true,
      numero: true,
      bairro: true,
      cidade: true,
      estado: true,
      cep: true,
      subestacoes: {
        include: {
          componentes: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Reordena os componentes de cada subestação
  const clientesOrdenados = clientes.map((cliente) => ({
    ...cliente,
    subestacoes: cliente.subestacoes.map((sub) => ({
      ...sub,
      componentes: sub.componentes.sort((a, b) => {
        const ordemA = ordemComponentes.indexOf(a.tipo);
        const ordemB = ordemComponentes.indexOf(b.tipo);

        // Se não encontrar, coloca no final
        return (
          (ordemA === -1 ? Infinity : ordemA) -
          (ordemB === -1 ? Infinity : ordemB)
        );
      }),
    })),
  }));

  const totalClientes = await prisma.cliente.count({ where });
  const totalPages = Math.ceil(totalClientes / limit);

  return res.status(200).json({
    status: true,
    message:
      clientesOrdenados.length > 0
        ? "Clientes localizados."
        : "Nenhum cliente encontrado.",
    data: {
      currentPage: parseInt(page) || 1,
      totalPages,
      totalClientes,
      clientes: clientesOrdenados,
    },
  });
};

/**
 * Busca cliente por ID
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
// SUBSTITUA A FUNÇÃO 'buscarCliente' ATUAL PELA VERSÃO ABAIXO

export const buscarCliente = async (req, res) => {
  const { clienteId } = req.validatedData.params;

  const clienteFromDb = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      subestacoes: {
        orderBy: { nome: "asc" },
        include: {
          componentes: true,
        },
      },
    },
  });

  if (!clienteFromDb) {
    return res.status(404).json({
      status: false,
      message: "Cliente não encontrado.",
    });
  }

  const clienteComComponentesOrdenados = {
    ...clienteFromDb,
    subestacoes: clienteFromDb.subestacoes.map((sub) => ({
      ...sub,
      componentes: sub.componentes.sort((a, b) => {
        const ordemA = ordemComponentes.indexOf(a.tipo);
        const ordemB = ordemComponentes.indexOf(b.tipo);

        // Se não encontrar, coloca no final
        return (
          (ordemA === -1 ? Infinity : ordemA) -
          (ordemB === -1 ? Infinity : ordemB)
        );
      }),
    })),
  };

  // Utiliza a nova função helper para padronizar a saída
  const clienteReestruturado = reestruturarClienteParaFrontend(
    clienteComComponentesOrdenados
  );

  return res.status(200).json({
    status: true,
    message: "Cliente encontrado com sucesso.",
    data: clienteReestruturado,
  });
};

// -------------------------------------------------------------------------------------------------------
// Secção equipamento
/**
 * Cadastra um novo equipamento no banco de dados e registrar no log.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarEquipamento = async (req, res) => {
  // Acessa os dados validados do corpo da requisição
  const { nome, descricao, modelo, numeroSerie } = req.validatedData.body;

  // Obtém a matrícula do usuário logado que está realizando a ação
  // Assumimos que o middleware de autenticação (requireAuth) anexa os dados do usuário a req.user
  const matriculaUsuarioLogado = req.user.matricula;

  // 1. Verifica se já existe um equipamento com o mesmo número de série
  const equipamentoExiste = await prisma.equipamento.findUnique({
    where: { numeroSerie: numeroSerie },
  });
  if (equipamentoExiste) {
    return res.status(409).json({
      // Usa o status 409 (Conflict) para indicar conflito de dados
      status: false,
      message: "Número de série já existe cadastrado em outro equipamento.",
    });
  }

  // 2. Cria o novo equipamento no banco de dados
  const dadosCriados = await prisma.equipamento.create({
    data: {
      nome: nome,
      descricao: descricao,
      modelo: modelo,
      numeroSerie: numeroSerie,
    },
  });

  // 3. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "CRIAR",
      entidade: "equipamento",
      dadosAfetados: dadosCriados,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 4. Retorna a resposta de sucesso
  return res.status(201).json({
    status: true,
    message: "Equipamento cadastrado com sucesso.",
    data: dadosCriados,
  });
};
/**
 * Atualiza os dados de um equipamento e registra a atividade no log.
 * A validação dos dados de entrada é gerenciada pelo middleware 'validateGenerico'.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarEquipamento = async (req, res) => {
  // 1. Obtém os dados validados do corpo e dos parâmetros
  const {
    body: dadosAtualizados,
    params: { equipamentoId },
  } = req.validatedData;

  // Obtém a matrícula do usuário logado que está realizando a ação
  // Assumimos que o middleware de autenticação (requireAuth) anexa os dados do usuário a req.user
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Verifica se o equipamento existe.
  // Usamos findUnique para IDs, que é mais eficiente.
  const equipamentoExiste = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
  });

  if (!equipamentoExiste) {
    return res.status(404).json({
      status: false,
      message: "Equipamento não encontrado.",
    });
  }

  // 3. Executa a atualização do equipamento
  const equipamentoAtualizado = await prisma.equipamento.update({
    where: { id: equipamentoId },
    data: dadosAtualizados,
  });

  // 4. Registra a atividade no log após a atualização
  await prisma.logAtividade.create({
    data: {
      acao: "ATUALIZAR",
      entidade: "equipamento",
      // Armazena um snapshot dos dados que foram atualizados
      dadosAfetados: equipamentoAtualizado,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 5. Retorna uma resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Equipamento atualizado com sucesso.",
    data: equipamentoAtualizado,
  });
};
/**
 * Deleta um equipamento e registra a atividade no log.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarEquipamento = async (req, res) => {
  // 1. Obtém o ID do equipamento dos parâmetros da URL já validados
  const { equipamentoId } = req.validatedData.params;

  // 2. Obtém a matrícula do usuário logado que está realizando a ação
  // Assumimos que o middleware de autenticação (requireAuth) anexa os dados do usuário a req.user
  const matriculaUsuarioLogado = req.user.matricula;

  // 3. Encontra o equipamento para obter um snapshot dos dados antes de deletá-lo
  // Usamos findUnique para buscar por um ID, que é mais eficiente
  const equipamentoParaDeletar = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
  });

  if (!equipamentoParaDeletar) {
    // Usa o status 404 para "Não Encontrado"
    return res.status(404).json({
      status: false,
      message: "Equipamento não encontrado ou já foi excluído.",
    });
  }

  // 4. Executa a deleção do equipamento
  await prisma.equipamento.delete({
    where: { id: equipamentoId },
  });

  // 5. Registra a atividade no log após a deleção
  await prisma.logAtividade.create({
    data: {
      acao: "EXCLUIR",
      entidade: "equipamento",
      // Armazena um snapshot dos dados do equipamento que foi deletado
      dadosAfetados: equipamentoParaDeletar,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 6. Retorna uma resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Equipamento excluído com sucesso.",
  });
};
/**
 * Lista todos os equipamentos com suporte a filtros e paginação.
 * A validação dos dados de entrada é gerenciada pelo middleware 'validateGenerico'.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarEquipamentos = async (req, res) => {
  // Acessa os dados já validados e tipados, fornecidos pelo middleware
  const { page, limit, nome, modelo, numeroSerie } = req.validatedData.query;

  // Constrói o objeto 'where' dinamicamente com base nos filtros opcionais
  const where = {
    ...(nome && {
      nome: {
        contains: nome,
        // mode: 'insensitive'
      },
    }),
    ...(modelo && {
      modelo: {
        contains: modelo,
        //  mode: 'insensitive'
      },
    }),
    ...(numeroSerie && {
      numeroSerie: {
        contains: numeroSerie,
        //  mode: 'insensitive'
      },
    }),
  };

  // 1. Busca os equipamentos no banco de dados com paginação e filtros
  const equipamentos = await prisma.equipamento.findMany({
    where,
    orderBy: { nome: "asc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  // 2. Conta o total de equipamentos com base nos filtros
  const totalEquipamentos = await prisma.equipamento.count({ where });
  const totalPages = Math.ceil(totalEquipamentos / limit);

  // 3. Retorna a resposta de sucesso
  return res.status(200).json({
    status: true,
    message:
      equipamentos.length > 0
        ? "Equipamentos encontrados."
        : "Nenhum equipamento encontrado com base no filtro usado.",
    data: {
      currentPage: page,
      totalPages,
      totalEquipamentos,
      equipamentos,
    },
  });
};

// -------------------------------------------------------------------------------------------------------
// Secção subestação
/**
 * Cadastra uma ou mais subestações e seus componentes para um cliente existente.
 * Garante a atomicidade da operação com uma transação.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarSubestacao = async (req, res) => {
  // 1. Obter dados validados
  const { clienteId } = req.validatedData.params;
  const subestacoesData = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Verificar se o cliente alvo realmente existe
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
  });
  if (!cliente) {
    return res.status(404).json({
      status: false,
      message: "Cliente não encontrado. Não é possível adicionar subestação.",
    });
  }

  // 3. Normalizar a entrada para sempre trabalhar com um array
  const subestacoesArray = Array.isArray(subestacoesData)
    ? subestacoesData
    : [subestacoesData];

  // 4. Iniciar a transação para garantir a atomicidade
  const result = await prisma.$transaction(async (prisma) => {
    // Cria as subestações e seus componentes
    const subestacoesCriadas = await Promise.all(
      subestacoesArray.map(async (subestacao) => {
        const { componentes, ...subestacaoData } = subestacao;

        const novaSubestacao = await prisma.subestacao.create({
          data: {
            ...subestacaoData,
            clienteId: clienteId, // Link com o cliente existente
          },
        });

        // Lógica para criar componentes (reaproveitada do seu cadastrarCliente)
        const componentesCriados = componentes
          ? await Promise.all(
              componentes.flatMap((c) => {
                return Array.from({ length: c.quantidade }, () =>
                  prisma.componente.create({
                    data: {
                      nomeEquipamento: `Componente ${c.tipo}`, // Nome genérico inicial
                      tipo: c.tipo,
                      subestacaoId: novaSubestacao.id, // Link com a nova subestação
                    },
                  })
                );
              })
            )
          : [];

        return { ...novaSubestacao, componentes: componentesCriados };
      })
    );

    // 5. Registra a atividade no log
    await prisma.logAtividade.create({
      data: {
        acao: "CRIAR",
        entidade: "subestacao",
        dadosAfetados: {
          clienteId: clienteId,
          subestacoes: subestacoesCriadas,
        },
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return subestacoesCriadas;
  });

  // 6. Retorna a resposta de sucesso
  return res.status(201).json({
    status: true,
    message: "Subestação(ões) cadastrada(s) com sucesso para o cliente.",
    data: result,
  });
};
// Atualiza dados subestação
/**
 * Atualiza os dados de uma subestação específica.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarSubestacao = async (req, res) => {
  // 1. Obter dados validados
  const { subestacaoId } = req.validatedData.params;
  const dadosAtualizados = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Verificar se há dados para atualizar
  if (Object.keys(dadosAtualizados).length === 0) {
    return res.status(400).json({
      status: false,
      message: "Nenhum dado fornecido para atualização.",
    });
  }

  // 3. Verificar se a subestação existe antes de tentar atualizar
  const subestacaoExiste = await prisma.subestacao.findUnique({
    where: { id: subestacaoId },
  });

  if (!subestacaoExiste) {
    return res.status(404).json({
      status: false,
      message: "Subestação não encontrada.",
    });
  }

  // 4. Executa a atualização no banco de dados
  const subestacaoAtualizada = await prisma.subestacao.update({
    where: { id: subestacaoId },
    data: dadosAtualizados,
  });

  // 5. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "ATUALIZAR",
      entidade: "subestacao",
      dadosAfetados: subestacaoAtualizada,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 6. Retorna a resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Subestação atualizada com sucesso.",
    data: subestacaoAtualizada,
  });
};
// Deletar subestação
/**
 * Deleta uma subestação e seus componentes/fotos associados (via cascade).
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarSubestacao = async (req, res) => {
  // 1. Obter dados validados
  const { subestacaoId } = req.validatedData.params;
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Encontra a subestação para obter um snapshot dos dados antes de deletar
  const subestacaoParaDeletar = await prisma.subestacao.findUnique({
    where: { id: subestacaoId },
  });

  if (!subestacaoParaDeletar) {
    return res.status(404).json({
      status: false,
      message: "Subestação não encontrada ou já foi excluída.",
    });
  }

  // 3. Executa a deleção. O 'onDelete: Cascade' no schema do Prisma
  // cuidará de remover os componentes e fotos relacionados.
  await prisma.subestacao.delete({
    where: { id: subestacaoId },
  });

  // 4. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "EXCLUIR",
      entidade: "subestacao",
      // Armazena um snapshot dos dados da subestação que foi deletada
      dadosAfetados: subestacaoParaDeletar,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 5. Retorna uma resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Subestação excluída com sucesso.",
  });
};
// Listar subestações
/**
 * Lista as subestações com suporte a filtros (por nome, por cliente) e paginação.
 * Inclui dados básicos do cliente associado para enriquecer a resposta.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarSubestacoes = async (req, res) => {
  // 1. Acessar os dados já validados da query
  const { page, limit, nome, clienteId } = req.validatedData.query;

  // 2. Construir o objeto 'where' dinamicamente
  const where = {
    ...(nome && {
      nome: {
        contains: nome,
        //  mode: 'insensitive'
      },
    }),
    ...(clienteId && { clienteId: clienteId }),
  };

  // 3. Executar as consultas em paralelo
  const [subestacoes, totalSubestacoes] = await Promise.all([
    prisma.subestacao.findMany({
      where,
      orderBy: {
        nome: "asc",
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        // Inclui o nome da empresa do cliente no resultado
        cliente: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    }),
    prisma.subestacao.count({ where }),
  ]);

  // 4. Calcular o total de páginas
  const totalPages = Math.ceil(totalSubestacoes / limit);

  // 5. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message:
      subestacoes.length > 0
        ? "Subestações encontradas."
        : "Nenhuma subestação encontrada para os filtros aplicados.",
    data: {
      currentPage: page,
      totalPages: totalPages,
      totalSubestacoes: totalSubestacoes,
      subestacoes: subestacoes,
    },
  });
};

// -----------------------------------------------------------------------------------------------------
// Cadastrar componente
/**
 * Cadastra um ou mais componentes para uma subestação existente.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarComponente = async (req, res) => {
  // 1. Obter dados validados
  const { subestacaoId } = req.validatedData.params;
  const componentesData = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Verificar se a subestação "pai" existe
  const subestacao = await prisma.subestacao.findUnique({
    where: { id: subestacaoId },
  });
  if (!subestacao) {
    return res.status(404).json({
      status: false,
      message:
        "Subestação não encontrada. Não é possível adicionar componente.",
    });
  }

  // 3. Normalizar a entrada para sempre trabalhar com um array
  const componentesArray = Array.isArray(componentesData)
    ? componentesData
    : [componentesData];

  // 4. Mapear os dados para o formato do Prisma e criar os componentes
  const componentesParaCriar = componentesArray.map((componente) => ({
    ...componente, // Pega todos os campos validados (nome, tipo, tag, etc.)
    subestacaoId: subestacaoId, // Adiciona a chave estrangeira
  }));

  // O Prisma permite criar múltiplos registros de uma vez com createMany
  const resultado = await prisma.componente.createMany({
    data: componentesParaCriar,
    skipDuplicates: true, // Opcional: ignora se tentar criar um componente duplicado
  });

  // 5. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "CRIAR",
      entidade: "componente",
      dadosAfetados: {
        subestacaoId: subestacaoId,
        componentesAdicionados: resultado.count,
      },
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 6. Retorna a resposta de sucesso
  return res.status(201).json({
    status: true,
    message: `${resultado.count} componente(s) cadastrado(s) com sucesso na subestação.`,
    data: resultado,
  });
};
// Atualizar componente
/**
 * Atualiza os dados de um componente específico.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarComponente = async (req, res) => {
  // 1. Obter dados validados
  const { componenteId } = req.validatedData.params;
  const dadosAtualizados = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Verificar se há dados para atualizar
  if (Object.keys(dadosAtualizados).length === 0) {
    return res.status(400).json({
      status: false,
      message: "Nenhum dado fornecido para atualização.",
    });
  }

  // 3. Verificar se o componente existe antes de tentar atualizar
  const componenteExiste = await prisma.componente.findUnique({
    where: { id: componenteId },
  });

  if (!componenteExiste) {
    return res.status(404).json({
      status: false,
      message: "Componente não encontrado.",
    });
  }

  // 4. Executa a atualização no banco de dados
  const componenteAtualizado = await prisma.componente.update({
    where: { id: componenteId },
    data: dadosAtualizados,
  });

  // 5. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "ATUALIZAR",
      entidade: "componente",
      dadosAfetados: componenteAtualizado,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 6. Retorna a resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Componente atualizado com sucesso.",
    data: componenteAtualizado,
  });
};
// Deletar componente
/**
 * Deleta um componente específico e os seus registos associados (via cascade).
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarComponente = async (req, res) => {
  // 1. Obter dados validados
  const { componenteId } = req.validatedData.params;
  const matriculaUsuarioLogado = req.user.matricula;

  // 2. Encontra o componente para obter um snapshot dos dados antes de deletar
  const componenteParaDeletar = await prisma.componente.findUnique({
    where: { id: componenteId },
  });

  if (!componenteParaDeletar) {
    return res.status(404).json({
      status: false,
      message: "Componente não encontrado ou já foi excluído.",
    });
  }

  // 3. Executa a deleção. O 'onDelete: Cascade' no schema do Prisma
  // cuidará de remover os Ensaios e Fotos relacionados.
  await prisma.componente.delete({
    where: { id: componenteId },
  });

  // 4. Registra a atividade no log
  await prisma.logAtividade.create({
    data: {
      acao: "EXCLUIR",
      entidade: "componente",
      // Armazena um snapshot dos dados do componente que foi deletado
      dadosAfetados: componenteParaDeletar,
      feitoPor: matriculaUsuarioLogado,
    },
  });

  // 5. Retorna uma resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Componente excluído com sucesso.",
  });
};
// Listar componentes
/**
 * Lista os componentes de uma subestação específica, com suporte a filtros e paginação.
 * Inclui dados da subestação e do cliente associado.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarComponentes = async (req, res) => {
  // 1. Acessar os dados já validados
  const { subestacaoId } = req.validatedData.params; // <-- ALTERADO: Vem dos params
  const { page, limit, nomeEquipamento, tipo, numeroSerie } =
    req.validatedData.query;

  // 2. Construir o objeto 'where'
  // O filtro principal agora é obrigatório e vem diretamente do subestacaoId
  const where = {
    subestacaoId: subestacaoId, // <-- ALTERADO: Filtro principal
    ...(nomeEquipamento && {
      nomeEquipamento: {
        contains: nomeEquipamento,
        //  mode: 'insensitive'
      },
    }),
    ...(tipo && { tipo: tipo }),
    ...(numeroSerie && {
      numeroSerie: {
        contains: numeroSerie,
        // mode: 'insensitive'
      },
    }),
  };

  // O resto da função permanece exatamente igual...

  // 3. Executar as consultas em paralelo
  const [componentes, totalComponentes] = await Promise.all([
    prisma.componente.findMany({
      where,
      orderBy: {
        nomeEquipamento: "asc",
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        subestacao: {
          select: {
            id: true,
            nome: true,
            cliente: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    }),
    prisma.componente.count({ where }),
  ]);

  // 4. Calcular o total de páginas
  const totalPages = Math.ceil(totalComponentes / limit);

  // 5. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message:
      componentes.length > 0
        ? "Componentes encontrados."
        : "Nenhum componente encontrado para esta subestação.",
    data: {
      currentPage: page,
      totalPages: totalPages,
      totalComponentes: totalComponentes,
      componentes: componentes,
    },
  });
};
// Listar componente pelo ID
/**
 * Busca um componente específico pelo seu ID.
 * Inclui dados da subestação e do cliente para um retorno completo.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarComponente = async (req, res) => {
  // 1. Obter o ID validado dos parâmetros da URL
  const { componenteId } = req.validatedData.params;

  // 2. Buscar o componente na base de dados usando findUnique
  const componente = await prisma.componente.findUnique({
    where: { id: componenteId },
    include: {
      // Inclui dados da subestação e do cliente para enriquecer a resposta
      subestacao: {
        select: {
          id: true,
          nome: true,
          cliente: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      ensaios: true,
      fotos: true,
    },
  });

  // 3. Verificar se o componente foi encontrado
  if (!componente) {
    return res.status(404).json({
      status: false,
      message: "Componente não encontrado.",
    });
  }

  // 4. Retornar a resposta de sucesso com os dados do componente
  return res.status(200).json({
    status: true,
    message: "Componente encontrado com sucesso.",
    data: componente,
  });
};

// -----------------------------------------------------------------------------------------------------
// Secção ordem de serviço
// Cadastrar ordem de serviço
/**
 * Cadastra uma nova Ordem de Serviço, validando e vinculando todas as
 * entidades relacionadas (cliente, funcionários, subestações, componentes)
 * de forma atómica dentro de uma transação.
 * Gera um número de OS único no formato AA-MM-SEQUENCIAL.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarOrdem = async (req, res) => {
  // 1. Obter todos os dados validados pelo novo schema Zod
  const dadosOS = req.validatedData.body;
  const matriculaUsuarioLogado = req.user.matricula;

  // --- LÓGICA DE GERAÇÃO DO NÚMERO DA OS ---
  const hoje = new Date();
  const ano = hoje.getFullYear().toString().slice(-2);
  const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");
  const prefixoOS = `${ano}${mes}`;

  const ultimaOS = await prisma.ordem.findFirst({
    where: { numeroOs: { startsWith: prefixoOS } },
    orderBy: { numeroOs: "desc" },
  });

  let proximoSequencial = 1;
  if (ultimaOS) {
    const sequencialStr = ultimaOS.numeroOs.split(prefixoOS)[1];
    if (sequencialStr) {
      proximoSequencial = parseInt(sequencialStr, 10) + 1;
    }
  }
  const numeroOs = prefixoOS + proximoSequencial.toString().padStart(3, "0");

  const numeroOrcamentoExist = await prisma.ordem.findFirst({
    where: { numeroOrcamento: dadosOS.numeroOrcamento },
  });

  if (numeroOrcamentoExist)
    return res.status(409).json({
      status: false,
      message: "Numero do orçamento existe, utilize outro.",
    });

  // --- TRANSAÇÃO ATÓMICA PARA CRIAR A OS ---

  // Extrai os IDs e informações relevantes do objeto aninhado vindo do front-end
  const clienteId = dadosOS.clienteId;
  const subestacoesId = dadosOS.subestacoes?.map((s) => s.id) || [];
  const componentesId =
    dadosOS.subestacoes?.flatMap((s) => s.componentes.map((c) => c.id)) || [];

  if (!clienteId) {
    return res
      .status(400)
      .json({ status: false, message: "O ID do cliente é obrigatório." });
  }

  const novaOrdem = await prisma.$transaction(async (tx) => {
    // 2. Validar se todas as entidades relacionadas existem
    const [cliente, funcionarios, subestacoes, componentes] = await Promise.all(
      [
        tx.cliente.findUnique({ where: { id: dadosOS.clienteId } }),
        tx.funcionario.findMany({
          where: {
            matricula: {
              in: [
                dadosOS.engenheiroMatricula,
                dadosOS.supervisorMatricula,
                ...(dadosOS.tecnicos?.map((t) => t.matricula) || []),
              ],
            },
          },
        }),
        tx.subestacao.findMany({
          where: {
            id: { in: dadosOS.subestacoesId || [] },
            clienteId: dadosOS.clienteId,
          },
        }),
        tx.componente.findMany({
          where: {
            id: { in: dadosOS.componentesId || [] },
            subestacao: { clienteId: dadosOS.clienteId },
          },
        }),
      ]
    );

    // Verificações de integridade
    if (!cliente) throw new Error("Cliente não encontrado.");
    const matriculasValidas = new Set([
      dadosOS.engenheiroMatricula,
      dadosOS.supervisorMatricula,
      ...dadosOS.tecnicos,
    ]);
    if (funcionarios.length !== matriculasValidas.size)
      throw new Error("Uma ou mais matrículas de funcionários são inválidas.");
    if (subestacoes.length !== (dadosOS.subestacoesId || []).length)
      throw new Error(
        "Uma ou mais subestações são inválidas ou não pertencem ao cliente."
      );
    if (componentes.length !== (dadosOS.componentesId || []).length)
      throw new Error(
        "Um ou mais componentes são inválidos ou não pertencem ao cliente."
      );

    // 3. Criar a Ordem de Serviço com TODOS os campos do schema.prisma
    const ordemCriada = await tx.ordem.create({
      data: {
        numeroOs,
        descricaoInicial: dadosOS.descricaoInicial,
        tipoServico: dadosOS.tipoServico,
        previsaoInicio: dadosOS.previsaoInicio,
        previsaoTermino: dadosOS.previsaoTermino,
        numeroOrcamento: dadosOS.numeroOrcamento,
        responsavel: dadosOS.responsavel,
        localizacao: dadosOS.localizacao,
        email: dadosOS.email,
        valorServico: dadosOS.valorServico,
        contato: dadosOS.contato,
        // Conectando as relações
        cliente: { connect: { id: dadosOS.clienteId } },
        engenheiro: { connect: { matricula: dadosOS.engenheiroMatricula } },
        supervisor: { connect: { matricula: dadosOS.supervisorMatricula } },
        tecnicos: {
          connect: (dadosOS.tecnicos || []).map((t) => ({
            matricula: t.matricula,
          })),
        },
        subestacoes: {
          connect: (dadosOS.subestacoesId || []).map((id) => ({ id })),
        },
        componentes: {
          connect: (dadosOS.componentesId || []).map((id) => ({ id })),
        },
      },
    });

    // 5. Criar o log de atividade
    await tx.logAtividade.create({
      data: {
        acao: "CRIAR",
        entidade: "ordem",
        dadosAfetados: ordemCriada,
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return ordemCriada;
  });

  // 5. Retornar a resposta de sucesso
  return res.status(201).json({
    status: true,
    message: `Ordem de Serviço ${novaOrdem.numeroOs} criada com sucesso.`,
    data: novaOrdem,
  });
};
// Atualizar dados ordem de serviço
/**
 * Atualiza uma Ordem de Serviço existente, aplicando regras de negócio
 * para o ciclo de vida (status) e sincronizando as relações
 * (técnicos, subestações, componentes).
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarOrdem = async (req, res) => {
  // 1. Obter dados validados e ID do utilizador
  const { ordemId } = req.validatedData.params;
  const dadosAtualizados = req.validatedData.body; // Este payload já vem formatado do front-end
  const { matricula: matriculaUsuarioLogado, nivelAcesso } = req.user;

  try {
    // 2. Buscar o estado atual da OS para validações
    const ordemAtual = await prisma.ordem.findUnique({
      where: { id: ordemId },
    });

    if (!ordemAtual) {
      return res
        .status(404)
        .json({ status: false, message: "Ordem de Serviço não encontrada." });
    }

    if (dadosAtualizados.componentes) {
      // ...garante que a nova lista não seja vazia.
      if (
        !dadosAtualizados.componentes.set ||
        dadosAtualizados.componentes.set.length === 0
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Não é possível remover todos os componentes. A Ordem de Serviço deve ter pelo menos um.",
        });
      }
    }

    // 3. APLICAR REGRAS DE NEGÓCIO (MÁQUINA DE ESTADOS E PERMISSÕES)
    const isAdminOuGerente =
      nivelAcesso === "ADMIN" ||
      nivelAcesso === "GERENTE" ||
      nivelAcesso === "ENGENHEIRO";

    if (ordemAtual.status === "FINALIZADA" && !isAdminOuGerente) {
      return res.status(403).json({
        status: false,
        message:
          "Acesso negado. A Ordem de Serviço está finalizada e não pode ser alterada.",
      });
    }

    if (
      dadosAtualizados.status &&
      ordemAtual.status === "ABERTA" &&
      dadosAtualizados.status === "FINALIZADA"
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Não é possível finalizar uma Ordem de Serviço que ainda está aberta.",
      });
    }

    // 4. Iniciar uma transação para garantir a atomicidade
    const ordemAtualizada = await prisma.$transaction(async (tx) => {
      // 5. Executar a atualização diretamente com o payload do front-end
      // Não é mais necessário construir o 'updateData', pois o front-end já fez isso.
      const osAtualizada = await tx.ordem.update({
        where: { id: ordemId },
        data: dadosAtualizados, // O payload já tem a sintaxe { connect: ... } e { set: ... }
      });

      // 6. Registar a atividade no log
      await tx.logAtividade.create({
        data: {
          acao: "ATUALIZAR",
          entidade: "ordem",
          dadosAfetados: { id: osAtualizada.id, alterações: dadosAtualizados },
          feitoPor: matriculaUsuarioLogado,
        },
      });

      return osAtualizada;
    });

    // 7. Retornar a resposta de sucesso
    return res.status(200).json({
      status: true,
      message: "Ordem de Serviço atualizada com sucesso.",
      data: ordemAtualizada,
    });
  } catch (error) {
    // Captura de erros de validação do Prisma ou outros erros inesperados
    if (error.code === "P2025") {
      // Código de erro comum do Prisma para "registro a ser atualizado não encontrado"
      return res.status(404).json({
        status: false,
        message:
          "Erro de relação: Um dos registros a serem conectados não foi encontrado.",
      });
    }
    console.error("Erro ao atualizar Ordem de Serviço:", error);
    return res
      .status(500)
      .json({ status: false, message: "Ocorreu um erro interno no servidor." });
  }
};
// Deletar ou cancelar ordem de serviço
/**
 * Deleta permanentemente (se for ADMIN) ou cancela (se for outro nível de acesso)
 * uma Ordem de Serviço.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarOuCancelarOrdem = async (req, res) => {
  // 1. Obter dados validados e info do utilizador
  const { ordemId } = req.validatedData.params;
  const { matricula: matriculaUsuarioLogado, nivelAcesso } = req.user;

  // 2. Buscar a OS para verificar o seu estado atual e para o log
  const ordemParaRemover = await prisma.ordem.findUnique({
    where: { id: ordemId },
  });

  if (!ordemParaRemover) {
    return res
      .status(404)
      .json({ status: false, message: "Ordem de Serviço não encontrada." });
  }

  // Regra de Negócio Adicional: Não permitir cancelar/deletar uma OS já finalizada
  if (ordemParaRemover.status === "FINALIZADA") {
    return res.status(403).json({
      status: false,
      message:
        "Não é possível remover uma Ordem de Serviço que já foi finalizada.",
    });
  }

  // 3. Lógica de decisão baseada no nível de acesso
  if (nivelAcesso === "ADMIN") {
    // --- AÇÃO DE EXCLUSÃO PERMANENTE (HARD DELETE) ---
    await prisma.ordem.delete({
      where: { id: ordemId },
    });

    await prisma.logAtividade.create({
      data: {
        acao: "EXCLUIR",
        entidade: "ordem",
        dadosAfetados: ordemParaRemover,
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return res.status(200).json({
      status: true,
      message: `Ordem de Serviço ${ordemParaRemover.numeroOs} foi permanentemente excluída.`,
    });
  } else {
    // --- AÇÃO DE CANCELAMENTO (SOFT DELETE) ---
    const ordemCancelada = await prisma.ordem.update({
      where: { id: ordemId },
      data: { status: "CANCELADO" },
    });

    await prisma.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "ordem",
        dadosAfetados: {
          id: ordemId,
          statusAnterior: ordemParaRemover.status,
          statusNovo: "CANCELADO",
        },
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return res.status(200).json({
      status: true,
      message: `Ordem de Serviço ${ordemParaRemover.numeroOs} foi movida para o status CANCELADO.`,
    });
  }
};
// Listar ordem por ID
/**
 * Busca uma Ordem de Serviço específica pelo seu ID, incluindo
 * todos os seus dados e relações associadas.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarOrdem = async (req, res) => {
  // 1. Obter o ID validado dos parâmetros
  const { ordemId } = req.validatedData.params;

  // 2. Buscar a Ordem de Serviço na base de dados
  const ordem = await prisma.ordem.findUnique({
    where: { id: ordemId },
    include: {
      // Incluir todos os dados relacionados para uma visão 360º
      cliente: true,
      engenheiro: { select: { nome: true, matricula: true, cargo: true } },
      supervisor: { select: { nome: true, matricula: true, cargo: true } },
      tecnicos: { select: { nome: true, matricula: true, cargo: true } },
      subestacoes: true, // Inclui todos os dados das subestações vinculadas
      componentes: true, // Inclui todos os dados dos componentes vinculados
      fotos: true, // Inclui as fotos associadas à OS
    },
  });

  // 3. Verificar se a OS foi encontrada
  if (!ordem) {
    return res.status(404).json({
      status: false,
      message: "Ordem de Serviço não encontrada.",
    });
  }

  // 4. Retornar a resposta de sucesso com os dados completos
  return res.status(200).json({
    status: true,
    message: "Ordem de Serviço encontrada com sucesso.",
    data: ordem,
  });
};

export const listarOrdens = async (req, res) => {
  // 1. Obter dados de paginação/filtro e do usuário logado
  // ASSUMINDO que req.user é injetado por um middleware, como no exemplo anterior
  const { matricula: matriculaUsuarioLogado, nivelAcesso } = req.user;
  const { page, limit, clienteId, tipoServico, status, dataInicio, dataFim } =
    req.validatedData.query;

  // 2. Constrói o objeto 'where' com os filtros da requisição
  const where = {
    ...(clienteId && { clienteId: clienteId }),
    ...(tipoServico && { tipoServico: tipoServico }),
    ...(status && { status: status }),
    ...(dataInicio &&
      dataFim && {
        previsaoInicio: {
          gte: new Date(dataInicio), // É uma boa prática converter para Date
          lte: new Date(dataFim),
        },
      }),
  };

  // 3. Adiciona as regras de NÍVEL DE ACESSO ao objeto 'where'
  // Esta é a principal modificação.
  switch (nivelAcesso) {
    case "SUPERVISOR":
      // Supervisor vê as ordens que ele supervisiona OU em que atua como técnico.
      // Usamos o operador 'OR' do Prisma para combinar as condições.
      where.OR = [
        { supervisorMatricula: matriculaUsuarioLogado },
        { tecnicos: { some: { matricula: matriculaUsuarioLogado } } },
      ];
      break;

    case "TECNICO":
      // Técnico só vê as ordens em que ele está na lista de técnicos.
      where.tecnicos = {
        some: { matricula: matriculaUsuarioLogado },
      };
      break;

    // ADMIN, GERENTE, ENGENHEIRO, OUTRO: Não adicionamos filtros extras.
    // Eles podem ver todas as ordens (respeitando os filtros de cliente, status, etc.).
    case "ADMIN":
    case "GERENTE":
    case "ENGENHEIRO":
    case "OUTRO":
    default:
      // Nenhuma ação necessária, o objeto 'where' permanece como está.
      break;
  }

  // 4. Executa as consultas ao banco de dados em paralelo com o 'where' já modificado
  const [ordens, totalOrdens, clientes] = await Promise.all([
    // A consulta de ordens agora respeita o nível de acesso
    prisma.ordem.findMany({
      where, // Objeto 'where' com filtros da query + filtros de acesso
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        numeroOs: true,
        tipoServico: true,
        previsaoInicio: true,
        status: true,
        cliente: {
          select: {
            nome: true,
          },
        },
      },
    }),
    // A contagem TAMBÉM respeita o nível de acesso, garantindo que a paginação funcione corretamente.
    prisma.ordem.count({ where }),
    // A busca de clientes não precisa de alteração
    prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: "asc",
      },
    }),
  ]);

  // 5. Formata os dados das ordens (sem alteração)
  const ordensFormatadas = ordens.map((os) => ({
    ...os,
    clienteNome: os.cliente?.nome || "N/A",
    cliente: undefined,
  }));

  // 6. Calcula o total de páginas (sem alteração)
  const totalPages = Math.ceil(totalOrdens / limit);

  // 7. Retorna a resposta completa (sem alteração)
  return res.status(200).json({
    status: true,
    message: "Ordens de serviço listadas com sucesso.",
    data: {
      ordens: ordensFormatadas,
      clientes: clientes,
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalOrdens,
    },
  });
};

export const buscarOrdemPorId = async (req, res) => {
  const { ordemId } = req.validatedData.params;

  const osExiste = await prisma.ordem.findUnique({
    where: { id: ordemId },
    include: {
      cliente: {
        include: {
          subestacoes: {
            orderBy: { nome: "asc" },
            include: {
              componentes: {
                orderBy: { nomeEquipamento: "asc" },
                include: {
                  ensaios: {
                    where: { ordemId: ordemId },
                    include: {
                      equipamentos: true,
                      responsavel: true, // ADICIONADO AQUI,
                      fotos: true,
                    },
                  },
                  ordens: {
                    select: {
                      id: true,
                      numeroOs: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      subestacoes: { select: { id: true } },
      componentes: { select: { id: true } },
      engenheiro: { select: { id: true, nome: true, matricula: true } },
      supervisor: { select: { id: true, nome: true, matricula: true } },
      tecnicos: { select: { id: true, nome: true, matricula: true } },
      fotos: true,
    },
  });

  if (!osExiste) {
    return res
      .status(404)
      .json({ status: false, message: "OS não localizada ou excluída" });
  }

  if (osExiste?.cliente?.subestacoes) {
    osExiste.cliente.subestacoes = osExiste.cliente.subestacoes.map((sub) => ({
      ...sub,
      componentes: sub.componentes.sort((a, b) => {
        const indexA = ordemComponentes.indexOf(a.tipo);
        const indexB = ordemComponentes.indexOf(b.tipo);

        // Se não estiver na lista, joga pro final em ordem alfabética
        if (indexA === -1 && indexB === -1) {
          return a.tipo.localeCompare(b.tipo);
        }
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      }),
    }));
  }

  // Utiliza a nova função helper para padronizar a saída dos dados do cliente aninhado
  if (osExiste.cliente) {
    osExiste.cliente = reestruturarClienteParaFrontend(osExiste.cliente);
  }

  return res.status(200).json({
    status: true,
    message: "OS localizada com sucesso.",
    data: osExiste,
  });
};

// -----------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço - Fluxo de Finalização
// Etapa de solicitação de revisão
/**
 * Etapa 1 do Fluxo de Finalização.
 * Altera o status de uma OS para AGUARDANDO_REVISAO_ADM,
 * registando quem e quando a solicitação foi feita.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const solicitarFinalizacao = async (req, res) => {
  // 1. Obter dados validados e info do utilizador
  const { ordemId } = req.validatedData.params;
  const { matricula: matriculaUsuarioLogado } = req.user;

  const ordemAtualizada = await prisma.$transaction(async (tx) => {
    // 2. Buscar a OS e verificar o seu estado atual
    const ordem = await tx.ordem.findUnique({
      where: { id: ordemId },
    });

    if (!ordem) {
      throw new Error("Ordem de Serviço não encontrada.");
    }

    // 3. Regra de Negócio: Só pode solicitar a finalização de OSs em andamento
    const statusValidos = ["EM_ANDAMENTO", "AGUARDANDO_PECAS", "PENDENCIA"];
    if (!statusValidos.includes(ordem.status)) {
      throw new Error(
        `Não é possível solicitar a finalização. A OS está com o status '${ordem.status}'.`
      );
    }

    // 4. Atualizar a OS para o próximo estado do fluxo
    const osAtualizada = await tx.ordem.update({
      where: { id: ordemId },
      data: {
        status: "AGUARDANDO_REVISAO",
        finalizacaoSolicitadaPor: matriculaUsuarioLogado,
        finalizacaoSolicitadaEm: new Date(),
      },
    });

    // 5. Registar a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "ordem",
        dadosAfetados: {
          id: ordemId,
          novoStatus: "AGUARDANDO_REVISAO",
          solicitadoPor: matriculaUsuarioLogado,
        },
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return osAtualizada;
  });

  // 6. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Solicitação de finalização registada. Aguardando revisão do ADM.",
    data: {
      ordemId: ordemAtualizada.id,
      status: ordemAtualizada.status,
    },
  });
};
// Etapa de revisão de solicitação
/**
 * Etapa 2 do Fluxo de Finalização.
 * Um ADM revisa a OS e a move para o estado AGUARDANDO_APROVACAO_ENGENHEIRO.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const revisarAdm = async (req, res) => {
  // 1. Obter dados validados e info do utilizador
  const { ordemId } = req.validatedData.params;
  const { matricula: matriculaUsuarioLogado } = req.user;

  const ordemAtualizada = await prisma.$transaction(async (tx) => {
    // 2. Buscar a OS e verificar o seu estado atual
    const ordem = await tx.ordem.findUnique({
      where: { id: ordemId },
    });

    if (!ordem) {
      throw new Error("Ordem de Serviço não encontrada.");
    }

    // 3. Regra de Negócio: Só pode ser revisada se estiver aguardando revisão do ADM
    if (ordem.status !== "AGUARDANDO_REVISAO") {
      throw new Error(
        `Não é possível revisar esta OS. O status atual é '${ordem.status}'.`
      );
    }

    // 4. Atualizar a OS para o próximo estado do fluxo
    const osAtualizada = await tx.ordem.update({
      where: { id: ordemId },
      data: {
        status: "AGUARDANDO_APROVACAO",
        revisaoAdmPor: matriculaUsuarioLogado,
        revisaoAdmEm: new Date(),
      },
    });

    // 5. Registar a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "ordem",
        dadosAfetados: {
          id: ordemId,
          novoStatus: "AGUARDANDO_APROVACAO",
          revisadoPor: matriculaUsuarioLogado,
        },
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return osAtualizada;
  });

  // 6. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message:
      "Revisão do ADM concluída. Aguardando aprovação final do engenheiro.",
    data: {
      ordemId: ordemAtualizada.id,
      status: ordemAtualizada.status,
    },
  });
};
// Etapa de aprovação
/**
 * Etapa 3 e Final do Fluxo de Finalização.
 * Um Engenheiro (ou superior) dá a aprovação final, movendo a OS para o estado FINALIZADA.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const aprovarFinal = async (req, res) => {
  // 1. Obter dados validados e info do utilizador
  const { ordemId } = req.validatedData.params;
  const { conclusao, recomendacoes } = req.validatedData.body;
  const { matricula: matriculaUsuarioLogado, nivelAcesso } = req.user;

  const ordemAtualizada = await prisma.$transaction(async (tx) => {
    // 2. Buscar a OS e verificar o seu estado atual
    const ordem = await tx.ordem.findUnique({
      where: { id: ordemId },
    });

    if (!ordem) {
      throw new Error("Ordem de Serviço não encontrada.");
    }

    // 3. Regra de Negócio: Só pode ser aprovada se estiver aguardando aprovação do engenheiro
    if (ordem.status !== "AGUARDANDO_APROVACAO") {
      throw new Error(
        `Não é possível aprovar esta OS. O status atual é '${ordem.status}'.`
      );
    }

    // 4. Regra de Segurança: Apenas o engenheiro da OS (ou um superior) pode aprovar
    const isEngenheiroDaOS =
      matriculaUsuarioLogado === ordem.engenheiroMatricula;
    const isSuperior = nivelAcesso === "GERENTE" || nivelAcesso === "ADMIN";

    if (!isEngenheiroDaOS && !isSuperior) {
      throw new Error(
        "Acesso negado. Apenas o engenheiro responsável pela OS ou um administrador podem dar a aprovação final."
      );
    }

    // 5. Atualizar a OS para o estado final
    const osAtualizada = await tx.ordem.update({
      where: { id: ordemId },
      data: {
        status: "FINALIZADA",
        conclusao: conclusao, // Adiciona a conclusão do engenheiro
        recomendacoes: recomendacoes, // Adiciona as recomendações
        aprovacaoEngenheiroPor: matriculaUsuarioLogado,
        aprovacaoEngenheiroEm: new Date(),
      },
    });

    // 6. Registar a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "ordem",
        dadosAfetados: {
          id: ordemId,
          novoStatus: "FINALIZADA",
          aprovadoPor: matriculaUsuarioLogado,
        },
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return osAtualizada;
  });

  // 7. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Ordem de Serviço finalizada com sucesso.",
    data: {
      ordemId: ordemAtualizada.id,
      status: ordemAtualizada.status,
    },
  });
};

// -----------------------------------------------------------------------------------------------------
// Cadastrar ensaio
/**
 * Cadastra um novo Ensaio, garantindo que ele seja único (por tipo e componente)
 * dentro do escopo da Ordem de Serviço especificada.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const cadastrarEnsaio = async (req, res) => {
  // 1. Obter dados validados
  const { numeroOs } = req.validatedData.params;
  const {
    componenteId,
    tipo,
    dados,
    dataEnsaio,
    responsavelMatricula,
    equipamentosIds,
  } = req.validatedData.body;
  const { matricula: matriculaUsuarioLogado } = req.user;

  // 2. Iniciar transação para garantir a integridade dos dados
  const novoEnsaio = await prisma.$transaction(async (tx) => {
    // 3. Validação CRÍTICA:
    // Verificar se a OS existe E se o componente está associado a ela.
    const ordemComComponente = await tx.ordem.findFirst({
      where: {
        numeroOs: numeroOs,
        componentes: {
          some: {
            id: componenteId,
          },
        },
      },
    });

    if (!ordemComComponente) {
      throw new Error(
        "A Ordem de Serviço não existe ou o componente especificado não faz parte do seu escopo."
      );
    }

    // <<< NOVA VALIDAÇÃO (A SUA REGRA) >>>
    // 4. Verificar se já não existe um ensaio do mesmo tipo, para o mesmo componente, NESTA OS.
    const ensaioExistente = await tx.ensaio.findFirst({
      where: {
        ordem: { numeroOs: numeroOs },
        componenteId: componenteId,
        tipo: tipo,
      },
    });

    if (ensaioExistente) {
      throw new Error(
        `Já existe um ensaio do tipo '${tipo}' para este componente nesta Ordem de Serviço.`
      );
    }
    // <<< FIM DA NOVA VALIDAÇÃO >>>

    // Validações opcionais (permanecem as mesmas)
    if (responsavelMatricula) {
      const responsavel = await tx.funcionario.findUnique({
        where: { matricula: responsavelMatricula },
      });
      if (!responsavel)
        throw new Error("A matrícula do responsável pelo ensaio é inválida.");
    }
    if (equipamentosIds && equipamentosIds.length > 0) {
      const equipamentosCount = await tx.equipamento.count({
        where: { id: { in: equipamentosIds } },
      });
      if (equipamentosCount !== equipamentosIds.length) {
        throw new Error(
          "Um ou mais IDs de equipamentos de medição são inválidos."
        );
      }
    }

    // 5. Se todas as validações passaram, criar o Ensaio
    const ensaioCriado = await tx.ensaio.create({
      data: {
        tipo,
        dados,
        dataEnsaio,
        ordem: { connect: { numeroOs: numeroOs } },
        componente: { connect: { id: componenteId } },
        ...(responsavelMatricula && {
          responsavel: { connect: { matricula: responsavelMatricula } },
        }),
        ...(equipamentosIds &&
          equipamentosIds.length > 0 && {
            equipamentos: { connect: equipamentosIds.map((id) => ({ id })) },
          }),
      },
      // ---- ALTERAÇÃO PRINCIPAL AQUI ----
      include: {
        equipamentos: true,
        responsavel: true, // ADICIONADO AQUI
      },
    });

    // 6. Registar a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "CRIAR",
        entidade: "ensaio",
        dadosAfetados: ensaioCriado,
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return ensaioCriado;
  });

  // 7. Retornar a resposta de sucesso
  return res.status(201).json({
    status: true,
    message: "Ensaio registado com sucesso.",
    data: novoEnsaio,
  });
};
// Atualizar ensaio  existente
/**
 * Atualiza os dados de um ensaio existente.
 * Impede a atualização se a Ordem de Serviço associada estiver finalizada ou cancelada.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const atualizarEnsaio = async (req, res) => {
  // 1. Obter dados validados
  const { ensaioId } = req.validatedData.params;
  const dadosAtualizados = req.validatedData.body;
  const { matricula: matriculaUsuarioLogado } = req.user;

  // 2. Iniciar transação
  const ensaioAtualizado = await prisma.$transaction(async (tx) => {
    // 3. Buscar o ensaio e verificar se ele existe
    const ensaioExistente = await tx.ensaio.findUnique({
      where: { id: ensaioId },
      include: { ordem: { select: { status: true } } }, // Inclui o status da OS pai
    });

    if (!ensaioExistente) {
      throw new Error("Ensaio não encontrado.");
    }

    // 4. Regra de Negócio: Não permitir edição se a OS estiver finalizada ou cancelada
    const statusDaOS = ensaioExistente.ordem.status;
    if (statusDaOS === "FINALIZADA" || statusDaOS === "CANCELADO") {
      throw new Error(
        `Não é possível atualizar o ensaio pois a OS associada está com o status '${statusDaOS}'.`
      );
    }

    // 5. Montar o payload de atualização para o Prisma
    const updateData = {
      ...dadosAtualizados,
      ...(dadosAtualizados.responsavelMatricula && {
        responsavel: {
          connect: { matricula: dadosAtualizados.responsavelMatricula },
        },
      }),
      ...(dadosAtualizados.equipamentosIds && {
        equipamentos: {
          set: dadosAtualizados.equipamentosIds.map((id) => ({ id })),
        },
      }),
    };
    delete updateData.responsavelMatricula;
    delete updateData.equipamentosIds;

    // 6. Executar a atualização
    const ensaioRealmenteAtualizado = await tx.ensaio.update({
      where: { id: ensaioId },
      data: updateData,
      include: {
        equipamentos: true,
        responsavel: true, // ADICIONADO AQUI
      },
    });

    // 7. Registar a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "ensaio",
        dadosAfetados: { id: ensaioId, alterações: dadosAtualizados },
        feitoPor: matriculaUsuarioLogado,
      },
    });

    return ensaioRealmenteAtualizado;
  });

  // 8. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Ensaio atualizado com sucesso.",
    data: ensaioAtualizado,
  });
};
// Deletar ensaio (somente se OS não estiver CONCLUÍDA OU CANCELADA)
/**
 * Deleta um ensaio específico. Acesso restrito a ADMINs pela rota.
 * Impede a exclusão se a Ordem de Serviço associada estiver finalizada ou cancelada.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const deletarEnsaio = async (req, res) => {
  // 1. Obter dados validados
  const { ensaioId } = req.validatedData.params;
  const { matricula: matriculaUsuarioLogado } = req.user;

  // 2. Iniciar transação
  await prisma.$transaction(async (tx) => {
    // 3. Buscar o ensaio para o log e para validação
    const ensaioParaDeletar = await tx.ensaio.findUnique({
      where: { id: ensaioId },
      include: { ordem: { select: { status: true } } },
    });

    if (!ensaioParaDeletar) {
      throw new Error("Ensaio não encontrado ou já foi excluído.");
    }

    // 4. Regra de Negócio: Preservar o histórico de OSs concluídas
    const statusDaOS = ensaioParaDeletar.ordem.status;
    if (statusDaOS === "FINALIZADA" || statusDaOS === "CANCELADO") {
      throw new Error(
        `Não é possível excluir o ensaio pois a OS associada está com o status '${statusDaOS}'.`
      );
    }

    // 5. Executar a exclusão
    await tx.ensaio.delete({
      where: { id: ensaioId },
    });

    // 6. Registar a atividade no log
    await tx.logAtividade.create({
      data: {
        acao: "EXCLUIR",
        entidade: "ensaio",
        dadosAfetados: ensaioParaDeletar, // Grava um snapshot do que foi excluído
        feitoPor: matriculaUsuarioLogado,
      },
    });
  });

  // 7. Retornar a resposta de sucesso
  return res.status(200).json({
    status: true,
    message: "Ensaio excluído com sucesso.",
  });
};

// Seção home #dashboard
export const homeDashboard = async (req, res) => {};

// Secção logs -------------------------------------------------------------------------------------------
/**
 * Lista os logs de atividade com suporte a filtros e paginação.
 * Acesso restrito a administradores, conforme definido na rota.
 * @param {object} req O objeto de requisição do Express.
 * @param {object} res O objeto de resposta do Express.
 */
export const listarLogs = async (req, res) => {
  // 1. Acessa os dados já validados e tipados, fornecidos pelo middleware
  const { page, limit, acao, entidade, feitoPor } = req.validatedData.query;

  // 2. Constrói o objeto 'where' dinamicamente com base nos filtros recebidos
  const where = {
    ...(acao && { acao: acao }),
    ...(entidade && {
      entidade: {
        contains: entidade,
        // mode: 'insensitive'
      },
    }),
    ...(feitoPor && { feitoPor: feitoPor }),
  };

  // 3. Executa as consultas ao banco de dados em paralelo para otimização
  const [logs, totalLogs] = await Promise.all([
    // Consulta para buscar os logs com filtros e paginação
    prisma.logAtividade.findMany({
      where,
      orderBy: {
        createdAt: "desc", // Ordena pelos mais recentes primeiro
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
    // Consulta para contar o total de logs que correspondem ao filtro
    prisma.logAtividade.count({ where }),
  ]);

  // 4. Calcula o total de páginas
  const totalPages = Math.ceil(totalLogs / limit);

  // 5. Retorna a resposta de sucesso com os dados e informações de paginação
  return res.status(200).json({
    status: true,
    message:
      logs.length > 0
        ? "Logs de atividade encontrados."
        : "Nenhum log encontrado para os filtros aplicados.",
    data: {
      currentPage: page,
      totalPages: totalPages,
      totalLogs: totalLogs,
      logs: logs,
    },
  });
};
