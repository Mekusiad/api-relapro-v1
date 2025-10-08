import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const dateSchema = z
  .string()
  .refine(
    (val) => {
      // Aceita formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return true;

      // Aceita ISOString válida
      return dayjs(val, dayjs.ISO_8601, true).isValid();
    },
    { message: "Data deve ser YYYY-MM-DD ou ISOString válida" }
  )
  .transform((val) => {
    if (!val) return undefined; // caso esteja vazio ou não informado

    // Se for YYYY-MM-DD, monta em timezone de Manaus
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return dayjs.tz(val, "America/Manaus").toISOString();
    }

    // Se for ISOString, normaliza para UTC
    return dayjs(val).toISOString();
  })
  .optional();
// Schemas
export const loginSchema = z.object({
  usuario: z.coerce
    .string()
    .min(1, "Nome de usuário é obrigatório.")
    .transform((val) => val.toLowerCase()),
  senha: z.coerce.string().min(5, "Senha é obrigatória."),
});

// Enum

const nivelAcessoEnum = z
  .enum(["ADMIN", "GERENTE", "ENGENHEIRO", "SUPERVISOR", "TECNICO", "OUTRO"], {
    required_error:
      "Nível de acesso aceito somente 'ADMIN','GERENTE', 'ENGENHEIRO','SUPERVISOR', 'TECNICO','OUTRO' ",
    invalid_type_error: "Nível de acesso inválido.",
  })
  .default("TECNICO");

const tipoFotoEnum = z.enum([
  "INICIAL",
  "ANTES",
  "DURANTE",
  "DEPOIS",
  "CLIENTE",
  "FUNCIONARIO",
  "EQUIPAMENTO",
  "SUBESTACAO",
  "COMPONENTE",
  "ENSAIO",
  "RECOMENDACAO",
  "OUTRO",
]);
const tipoTensaoEnum = z
  .enum(["X", "Y", "N/A", ""], {
    // Adicionado "" à lista de valores permitidos
    invalid_type_error: "Tipo de tensao inválido.",
  })
  .nullable() // Permite que o valor seja nulo
  .optional()
  .transform((val) => (val === "" ? null : val)); // Transforma "" em null

const tipoPressaoEnum = z
  .enum(["GAS", "OLEO", "N/A", ""], {
    // Adicionado "" à lista de valores permitidos
    invalid_type_error: "Tipo de pressão inválido.",
  })
  .nullable() // Permite que o valor seja nulo
  .optional()
  .transform((val) => (val === "" ? null : val)); // Transforma "" em null

const tipoComponenteEnum = z.enum(
  [
    "MALHA",
    "RESISTOR",
    "PARARAIO",
    "CABOMUFLA",
    "CHAVE_SECCIONADORA_ALTA",
    "CHAVE_SECCIONADORA_MEDIA",
    "CHAVE_SECCIONADORA_BAIXA",
    "DISJUNTOR_ALTA",
    "DISJUNTOR_MEDIA",
    "DISJUNTOR_BAIXA",
    "TRAFO_ALTA",
    "TRAFO_CORRENTE",
    "TRAFO_POTENCIAL",
    "TRAFO_FORCA",
    "TRAFO_MEDIA",
    "TRAFO_BAIXA",
    "BATERIA",
    "CAPACITOR",
    "BUCHA",
    "RELE",
    "OUTRO",
  ],
  {
    required_error: "É obrigatório informar o tipo de componente.",
    invalid_type_error: "Tipo de componente inválido.",
  }
);

const tipoServicoEnum = z.enum([
  "MANUTENCAO_PREVENTIVA",
  "MANUTENCAO_CORRETIVA",
  "MANUTENCAO_PREDITIVA",
  "FOTOGRAFICO",
  "TERMOGRAFIA",
  "ENSAIO_EPI",
  "INSTALACAO",
  "INSPECAO",
  "REFORMA",
  "OUTRO",
]);

const statusOrdemEnum = z.enum([
  "ABERTA",
  "EM_ANDAMENTO",
  "AGUARDANDO_PECAS",
  "CANCELADA",
  "PENDENCIA",
  "FINALIZADA",
]);

// -------------------------------------------------------------------------------------------------------
// Secção funcionário
// Cadastrar funcionário
const cadastrarFuncionarioBodySchema = z.object({
  nome: z
    .string()
    .min(3, {
      message: "O nome deve conter pelo menos 3 caracteres.",
    })
    .transform((val) => val.trim()), // Remove espaços em branco antes e depois

  matricula: z.coerce
    .number()
    .int({ message: "A matrícula deve ser um número inteiro." })
    .positive({ message: "A matrícula deve ser um número positivo." })
    .max(2147483647, {
      message: "A matrícula excede o valor máximo permitido (2.147.483.647).",
    }),

  // O usuário é opcional, pois será gerado se não for fornecido
  usuario: z
    .string()
    .optional()
    .transform((val) => val?.trim()),

  // O cargo é obrigatório no cadastro
  cargo: z
    .string()
    .min(3, {
      message: "O cargo deve conter pelo menos 3 caracteres.",
    })
    .transform((val) => val.trim()),

  // A senha é obrigatória no cadastro
  senha: z.string().min(6, {
    message: "A senha deve conter pelo menos 6 caracteres.",
  }),

  // Nível de acesso deve ser um dos valores do ENUM NivelAcesso
  nivelAcesso: nivelAcessoEnum,

  // Admissão é um campo opcional
  admissao: z.string().datetime().optional(),
});
export const cadastrarFuncionarioSchema = z.object({
  body: cadastrarFuncionarioBodySchema,
  // Para esta rota, não há validações de 'params' ou 'query'
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
// Atualizar dados funcionário
const atualizarDadosFuncionarioBodySchema = z.object({
  nome: z
    .string()
    .min(3, {
      message: "O nome deve conter pelo menos 3 caracteres.",
    })
    .transform((val) => val.trim())
    .optional(),

  matricula: z.coerce
    .number()
    .int({ message: "A matrícula deve ser um número inteiro." })
    .positive({ message: "A matrícula deve ser um número positivo." })
    .max(2147483647, {
      message: "A matrícula excede o valor máximo permitido (2.147.483.647).",
    })
    .optional(),

  usuario: z
    .string()
    .optional()
    .transform((val) => val?.trim()),

  cargo: z
    .string()
    .min(3, {
      message: "O cargo deve conter pelo menos 3 caracteres.",
    })
    .transform((val) => val.trim())
    .optional(),

  // A senha é opcional, mas se for enviada, precisa seguir a regra de min()
  senha: z
    .string()
    .min(6, {
      message: "A senha deve conter pelo menos 6 caracteres.",
    })
    .optional(),

  nivelAcesso: nivelAcessoEnum,

  admissao: z.string().datetime().optional(),
  demissao: z.string().datetime().optional(),
});
const atualizarDadosFuncionarioParamsSchema = z.object({
  matricula: z
    .string()
    .min(1, "A matrícula do usuário é obrigatória.")
    .transform((val) => parseInt(val, 10)),
  outraMatricula: z
    .string()
    .min(1, {
      message: "A matrícula de quem será deletado é obrigatória.",
    })
    .transform((val) => parseInt(val, 10)), // Converte para número
});
export const atualizarDadosFuncionarioSchema = z.object({
  body: atualizarDadosFuncionarioBodySchema.partial(),
  params: atualizarDadosFuncionarioParamsSchema,
  query: z.object({}).optional(),
});
// Deletar funcionário
export const deletarFuncionarioSchema = z.object({
  body: z.object({}).optional().optional(),
  params: atualizarDadosFuncionarioParamsSchema,
  query: z.object({}).optional().optional(),
});
// Listar funcionários
const listarFuncionariosQuerySchema = z.object({
  // Paginação
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  // Filtros
  nome: z.string().optional(),
  matricula: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  cargo: z.string().optional(),
  nivelAcesso: z.string().optional(),
});
export const listarFuncionariosSchema = z.object({
  // Não há validações de 'body' ou 'params' para esta rota
  body: z.object({}).optional().optional(),
  params: z.object({}).optional(),
  query: listarFuncionariosQuerySchema,
});
// Busca funcionário por matricula
const buscaFuncionariosParamsSchema = z.object({
  matricula: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  outraMatricula: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});
export const buscaFuncionarioSchema = z.object({
  // Não há validações de 'body' ou 'params' para esta rota
  body: z.object({}).optional(),
  params: buscaFuncionariosParamsSchema,
  query: z.object({}).optional(),
});

// -------------------------------------------------------------------------------------------------------
// Secção cliente
// Cadastrar cliente
// --- SCHEMAS PARA CADA TIPO DE "INFO" ---
// Criamos um schema para o objeto "info" de cada tipo de componente.

const malhaInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  identificacao: z.string().nullable().optional(),
});

const resistorInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  tipoEquipamento: z.string().nullable().optional(),
  anoFabricacao: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  tensao: z.string().nullable().optional(),
  correnteNominal: z.string().nullable().optional(),
});

const pararaioInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  tensaoNominal: z.string().nullable().optional(),
  curtoCircuito: z.string().nullable().optional(),
});

const caboMuflaInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  identificacao: z.string().nullable().optional(),
  circuito: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(), // 'modelo' é o nome do campo para 'TIPO'
  fabricante: z.string().nullable().optional(),
  tensao: z.string().nullable().optional(),
  secaoCabo: z.string().nullable().optional(),
});

const chaveSeccionadoraInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  identificacao: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  tensaoNominal: z.string().nullable().optional(),
  correnteNominal: z.string().nullable().optional(),
});

const disjuntorAltaInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  identificacao: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  meioIsolante: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  tensaoNominal: z.string().nullable().optional(),
  correnteNominal: z.string().nullable().optional(),
  pressao: z.string().nullable().optional(),
  tipoPressao: tipoPressaoEnum,
});

const disjuntorMediaInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  identificacao: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  tensaoNominal: z.string().nullable().optional(),
  meioIsolante: z.string().nullable().optional(),
  correnteNominal: z.string().nullable().optional(),
});

const trafoPotenciaInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  meioIsolante: z.string().nullable().optional(),
  potencia: z.string().nullable().optional(),
  tipoTensaoAt: tipoTensaoEnum, // enum continua obrigatório
  tensaoPrimario: z.string().nullable().optional(),
  tensaoSecundario: z.string().nullable().optional(),
  tipoTensaoBt: tipoTensaoEnum, // enum continua obrigatório
  volumeOleoIsolante: z.string().nullable().optional(),
});

const trafoPotencialInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  anoFabricacao: z.string().nullable().optional(),
  meioIsolante: z.string().nullable().optional(),
  tensaoSecundario: z.string().nullable().optional(),
  tensaoPrimario: z.string().nullable().optional(),
});

const trafoCorrenteInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  anoFabricacao: z.string().nullable().optional(),
  meioIsolante: z.string().nullable().optional(),
  correnteSecundario: z.string().nullable().optional(),
  correntePrimario: z.string().nullable().optional(),
});

const bateriaInfoSchema = z.object({
  localizacao: z.string().nullable().optional(),
  tensaoNominal: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  correnteNominal: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  numeroSerie: z.string().nullable().optional(),
  quantidade: z.coerce.number().int().positive().default(1),
});

// --- SCHEMA BASE E SCHEMAS COMPLETOS PARA CADA COMPONENTE ---

// Schema base com os campos comuns a todos os componentes
const baseComponenteSchema = z.object({
  id: z.string().optional(),
  nomeEquipamento: z.string(),
});
const malhaSchema = baseComponenteSchema.extend({
  tipo: z.literal("MALHA"),
  info: malhaInfoSchema.optional(),
});
const resistorSchema = baseComponenteSchema.extend({
  tipo: z.literal("RESISTOR"),
  info: resistorInfoSchema.optional(),
});
const pararaioSchema = baseComponenteSchema.extend({
  tipo: z.literal("PARARAIO"),
  info: pararaioInfoSchema.optional(),
});
const caboMuflaSchema = baseComponenteSchema.extend({
  tipo: z.literal("CABOMUFLA"),
  info: caboMuflaInfoSchema.optional(),
});
const chaveSeccionadoraAltaSchema = baseComponenteSchema.extend({
  tipo: z.literal("CHAVE_SECCIONADORA_ALTA"),
  info: chaveSeccionadoraInfoSchema.optional(),
});
const chaveSeccionadoraMediaSchema = baseComponenteSchema.extend({
  tipo: z.literal("CHAVE_SECCIONADORA_MEDIA"),
  info: chaveSeccionadoraInfoSchema.optional(),
});
const disjuntorAltaSchema = baseComponenteSchema.extend({
  tipo: z.literal("DISJUNTOR_ALTA"),
  info: disjuntorAltaInfoSchema.optional(),
});
const disjuntorMediaSchema = baseComponenteSchema.extend({
  tipo: z.literal("DISJUNTOR_MEDIA"),
  info: disjuntorMediaInfoSchema.optional(),
});
const trafoAltaSchema = baseComponenteSchema.extend({
  tipo: z.literal("TRAFO_ALTA"),
  info: trafoPotenciaInfoSchema.optional(),
});
const trafoPotencialSchema = baseComponenteSchema.extend({
  tipo: z.literal("TRAFO_POTENCIAL"),
  info: trafoPotencialInfoSchema.optional(),
});
const trafoCorrenteSchema = baseComponenteSchema.extend({
  tipo: z.literal("TRAFO_CORRENTE"),
  info: trafoCorrenteInfoSchema.optional(),
});
const trafoMediaSchema = baseComponenteSchema.extend({
  tipo: z.literal("TRAFO_MEDIA"),
  info: trafoPotenciaInfoSchema.optional(),
});
const bateriaSchema = baseComponenteSchema.extend({
  tipo: z.literal("BATERIA"),
  info: bateriaInfoSchema.optional(),
});

// --- SCHEMA FINAL DO COMPONENTE USANDO DISCRIMINATED UNION ---

const componenteSchema = z.discriminatedUnion("tipo", [
  malhaSchema,
  resistorSchema,
  pararaioSchema,
  caboMuflaSchema,
  chaveSeccionadoraAltaSchema,
  chaveSeccionadoraMediaSchema,
  disjuntorAltaSchema,
  disjuntorMediaSchema,
  trafoAltaSchema,
  trafoPotencialSchema,
  trafoCorrenteSchema,
  trafoMediaSchema,
  bateriaSchema,
]);

// --- SCHEMA DA SUBESTAÇÃO E DO CLIENTE ---

const subestacaoSchema = z
  .object({
    id: z.string().optional(),
    nome: z.string().min(1, { message: "O nome da subestação é obrigatório." }),
    componentes: z.array(componenteSchema).optional(),
  })
  .passthrough();

const clienteBodySchema = z.object({
  id: z.number().optional(),
  nome: z
    .string()
    .min(1, { message: "O nome da empresa deve ter no mínimo 1 caracter." }),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  contato: z.string().optional(),
  subestacoes: z.array(subestacaoSchema).optional(),
});

export const cadastrarClienteSchema = z.object({
  body: clienteBodySchema,
});
// Atualizar dados cliente
// Cria o schema para os parâmetros da URL, que contêm o ID do cliente a ser atualizado
const clienteParamsSchema = z.object({
  matricula: z.string().min(1, "A matrícula do usuário é obrigatória."),
  clienteId: z.string().uuid({
    message: "ID de cliente inválido.",
  }),
});
export const atualizarDadosClienteSchema = z.object({
  body: clienteBodySchema,
  params: z.object({
    matricula: z.string().min(1, "A matrícula do usuário é obrigatória."),
    clienteId: z
      .string()
      .uuid({ message: "O ID do cliente na URL é inválido." }),
  }),
});
// Deletar cliente
export const deletarClienteSchema = z.object({
  body: z.object({}).optional(),
  params: clienteParamsSchema,
  query: z.object({}).optional(),
});
// Listar clientes
const listarClientesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  nomeEmpresa: z.string().optional(),
  cnpj: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
});
// Buscar cliente por ID
export const buscarClienteSchema = z.object({
  // Para esta rota GET, não há corpo (body) nem query string, apenas parâmetros na URL
  params: z.object({
    matricula: z.string().min(1, "A matrícula do usuário é obrigatória."),
    clienteId: z.string().min(1, "O ID do cliente é obrigatório."),
  }),
});
// Schema para a rota de listagem de clientes
export const listarClientesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listarClientesQuerySchema,
});
// Listar ordens de serviço
const listarOrdensQuerySchemaPage = z.object({
  // Paginação
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),

  // Filtros
  clienteId: z.string().uuid({ message: "ID de cliente inválido." }).optional(),
  tipoServico: z
    .enum([
      "MANUTENCAO_PREVENTIVA",
      "MANUTENCAO_CORRETIVA",
      "MANUTENCAO_PREDITIVA",
      "FOTOGRAFICO",
      "TERMOGRAFIA",
      "ENSAIO_EPI",
      "INSTALACAO",
      "INSPECAO",
      "REFORMA",
      "OUTRO",
    ])
    .optional(),
  status: z
    .enum([
      "ABERTA",
      "EM_ANDAMENTO",
      "CANCELADA",
      "AGUARDANDO_PECAS",
      "AGUARDANDO_REVISAO",
      "AGUARDANDO_APROVACAO",
      "PENDENCIA",
      "FINALIZADA",
    ])
    .optional(),
  dataInicio: dateSchema,
  dataFim: dateSchema,
});

export const listarOrdensSchemaPage = z.object({
  params: z.object({
    matricula: z.string().min(1, "A matrícula do usuário é obrigatória."),
  }),
  query: listarOrdensQuerySchemaPage,
});
// -------------------------------------------------------------------------------------------------------
// Secção equipamento de medição
// Cadastrar equipamento
const equipamentoBodySchema = z.object({
  // O nome, descrição e modelo são opcionais
  nome: z.string().optional(),
  descricao: z.string().optional(),
  modelo: z.string().optional(),

  // O 'numeroSerie' é obrigatório e deve ser uma string única
  numeroSerie: z
    .string()
    .min(1, {
      message: "O número de série é obrigatório.",
    })
    .transform((val) => val.trim()),
});
export const cadastrarEquipamentoSchema = z.object({
  body: equipamentoBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
// Atualizar equipamento
const atualizarEquipamentoBodySchema = z.object({
  nome: z
    .string()
    .max(1000, {
      message: "Máximo de 1000 caracteres excedido.",
    })
    .transform((val) => val.trim())
    .optional(),

  descricao: z
    .string()
    .max(1000, {
      message: "Máximo de 1000 caracteres excedido.",
    })
    .transform((val) => val.trim())
    .optional(),

  modelo: z
    .string()
    .max(1000, {
      message: "Máximo de 1000 caracteres excedido.",
    })
    .transform((val) => val.trim())
    .optional(),

  // O número de série é um campo 'unique' no seu schema, então a validação
  // garante que é uma string não vazia.
  numeroSerie: z
    .string()
    .min(1, {
      message: "O número de série não pode ser vazio.",
    })
    .transform((val) => val.trim())
    .optional(),
});
const atualizarEquipamentoParamsSchema = z.object({
  // O ID do equipamento é um UUID (String), não um número, conforme o seu schema
  equipamentoId: z.string().uuid({
    message: "ID de equipamento inválido.",
  }),
});
export const atualizarEquipamentoSchema = z.object({
  // Valida o corpo da requisição usando o schema de atualização
  body: atualizarEquipamentoBodySchema.partial(),
  // Valida os parâmetros da URL usando o schema de parâmetros
  params: atualizarEquipamentoParamsSchema,
  // Garante que a query string esteja vazia
  query: z.object({}).optional(),
});
// Deletar equipamento
const deletarEquipamentoParamsSchema = z.object({
  // O ID é um UUID (String), não um número, conforme o seu schema
  equipamentoId: z.string().uuid({
    message: "ID de equipamento inválido.",
  }),
});
export const deletarEquipamentoSchema = z.object({
  // Garante que o body esteja vazio
  body: z.object({}).optional(),
  // Usa o schema que valida apenas o ID
  params: deletarEquipamentoParamsSchema,
  // Garante que a query string esteja vazia
  query: z.object({}).optional(),
});
// Listar equipamentos
const listarEquipamentosQuerySchema = z.object({
  // Paginação
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  // Filtros opcionais
  nome: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
});
export const listarEquipamentosSchema = z.object({
  // Não há validações de 'body' ou 'params' para esta rota
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listarEquipamentosQuerySchema,
});

// -------------------------------------------------------------------------------------------------------
// Secção Subestação
// Cadastrar subestação
const cadastrarSubestacaoParamsSchema = z.object({
  clienteId: z.string().uuid({ message: "ID de cliente inválido." }),
});

const cadastrarSubestacaoBodySchema = z.union([
  subestacaoSchema,
  z
    .array(subestacaoSchema)
    .min(1, { message: "O array de subestações não pode estar vazio." }),
]);

export const cadastrarSubestacaoSchema = z.object({
  body: cadastrarSubestacaoBodySchema,
  params: cadastrarSubestacaoParamsSchema,
  query: z.object({}).optional(),
});
// Atualizar subestação
const atualizarSubestacaoParamsSchema = z.object({
  subestacaoId: z.string().uuid({ message: "ID de subestação inválido." }),
});

const atualizarSubestacaoBodySchema = z.object({
  nome: z.string().min(1, { message: "O nome não pode ser uma string vazia." }),
  observacao: z.string().optional(), // A observação pode ser uma string vazia ou nula
});

export const atualizarSubestacaoSchema = z.object({
  body: atualizarSubestacaoBodySchema.partial(), // .partial() torna todos os campos do body opcionais
  params: atualizarSubestacaoParamsSchema,
  query: z.object({}).optional(),
});
// Deletar subestação
const deletarSubestacaoParamsSchema = z.object({
  subestacaoId: z.string().uuid({ message: "ID de subestação inválido." }),
});

export const deletarSubestacaoSchema = z.object({
  body: z.object({}).optional(), // O corpo da requisição deve estar vazio
  params: deletarSubestacaoParamsSchema,
  query: z.object({}).optional(), // A query string deve estar vazia
});
// Listar subestações
const listarSubestacoesQuerySchema = z.object({
  // Paginação
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  // Filtros
  nome: z.string().optional(),
  clienteId: z.string().uuid({ message: "ID de cliente inválido." }).optional(),
});

export const listarSubestacoesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listarSubestacoesQuerySchema,
});

// -------------------------------------------------------------------------------------------------------
// Secção Componente
// Cadastrar Componente

const cadastrarComponenteParamsSchema = z.object({
  subestacaoId: z.string().uuid({ message: "ID de subestação inválido." }),
});

const cadastrarComponenteBodySchema = z.object({
  nomeEquipamento: z
    .string()
    .min(1, { message: "O nome do equipamento é obrigatório." }),
  tipo: tipoComponenteEnum,
  tag: z.string().optional(),
  identificacao: z.string().optional(),
  localizacao: z.string().optional(),
  modelo: z.string().optional(),
  fabricante: z.string().optional(),
  numeroSerie: z.string().optional(),
  quantidade: z.coerce.number().int().positive().default(1),
  meioIsolante: z.coerce.string().optional(),
  anoFabricacao: z.coerce.number().int().optional(),
  massaTotal: z.coerce.number().optional(),
  potencia: z.coerce.string().optional(),
  correnteNominal: z.coerce.number().optional(),
  tensaoNominal: z.coerce.number().optional(),
  tensaoAt: z.coerce.number().optional(),
  tensaoBt: z.coerce.string().max(100, "Máximo de 100 caractere").optional(),
  correntePrimario: z.coerce
    .number()
    .max(999999, "Máximo 999999 dígitos.")
    .optional(),
  correnteSecundario: z.coerce
    .number()
    .max(999999, "Máximo 999999 dígitos.")
    .optional(),
  volumeOleoIsolante: z.coerce.number().optional(),
  temperaturaEnsaio: z.coerce.number().optional(),
  umidadeRelativaAr: z.coerce.number().optional(),
  impedancia: z.coerce.number().optional(),
  exatidao: z.coerce.string().optional(),
  frequencia: z.coerce.number().optional(),
  circuito: z.coerce.string().max(100, "Máximo de 100 caracteres.").optional(),
  curtoCircuito: z.coerce
    .string()
    .max(100, "Máximo de 100 caracteres.")
    .optional(),
  pressao: z.coerce.number().max(999999, "Máximo 999999 dígitos.").optional(),
  bitolaCabo: z.coerce
    .number()
    .max(999999, "Máximo 999999 dígitos.")
    .optional(),
  tipoTensaoAt: tipoTensaoEnum,
  tipoTensaoBt: tipoTensaoEnum,
  tipoPressao: tipoPressaoEnum,
});

export const cadastrarComponenteSchema = z.object({
  // Permite cadastrar um único componente ou um array deles
  body: z.union([
    cadastrarComponenteBodySchema,
    z
      .array(cadastrarComponenteBodySchema)
      .min(1, { message: "O array não pode estar vazio." }),
  ]),
  params: cadastrarComponenteParamsSchema,
  query: z.object({}).optional(),
});
// Atualizar Componente
const atualizarComponenteParamsSchema = z.object({
  componenteId: z.string().uuid({ message: "ID de componente inválido." }),
});

const atualizarComponenteBodySchema = z.object({
  nomeEquipamento: z
    .string()
    .max(1000, { message: "Máximo de 1000 caracteres." })
    .nullable(),
  tipo: tipoComponenteEnum,
  tag: z.string().nullable(),
  localizacao: z.string().nullable(),
  modelo: z.string().nullable(),
  fabricante: z.string().nullable(),
  numeroSerie: z.string().nullable(),
  quantidade: z.coerce.number().int().positive().default(1),
  meioIsolante: z.string().nullable(),
  anoFabricacao: z.string().nullable(),
  massaTotal: z.string().nullable(),
  potencia: z.string().nullable(),
  correnteNominal: z.string().nullable(),
  tensaoNominal: z.string().nullable(),
  tensaoPrimario: z.string().nullable(),
  tensaoSecundario: z.string().nullable(),
  correntePrimario: z.string().nullable(),
  correnteSecundario: z.string().nullable(),
  volumeOleoIsolante: z.string().nullable(),
  temperaturaEnsaio: z.string().nullable(),
  umidadeRelativaAr: z.string().nullable(),
  impedancia: z.string().nullable(),
  exatidao: z.string().nullable(),
  frequencia: z.string().nullable(),
  curtoCircuito: z.string().max(100, "Máximo de 100 caracteres.").nullable(),
  pressao: z.string().nullable(),

  // ==================================================================
  // INÍCIO DA CORREÇÃO - Campos de "Cabos e muflas" adicionados
  // ==================================================================
  identificacao: z.string().nullable(),
  circuito: z.string().max(100, "Máximo de 100 caracteres.").nullable(),
  tensao: z.string().nullable(),
  secaoCabo: z.string().nullable(),
  // ==================================================================
  // FIM DA CORREÇÃO
  // ==================================================================

  tipoTensaoAt: tipoTensaoEnum,
  tipoTensaoBt: tipoTensaoEnum,
  tipoPressao: tipoPressaoEnum,
});

export const atualizarComponenteSchema = z.object({
  body: atualizarComponenteBodySchema.partial(), // .partial() torna todos os campos opcionais
  params: atualizarComponenteParamsSchema,
  query: z.object({}).optional(),
});
// Deletar Componente
const deletarComponenteParamsSchema = z.object({
  componenteId: z.string().uuid({ message: "ID de componente inválido." }),
});

export const deletarComponenteSchema = z.object({
  body: z.object({}).optional(),
  params: deletarComponenteParamsSchema,
  query: z.object({}).optional(),
});
// Listar Componentes
const listarComponentesParamsSchema = z.object({
  // <-- NOVO: Schema para os parâmetros da URL
  subestacaoId: z.string().uuid({ message: "ID de subestação inválido." }),
});

const listarComponentesQuerySchema = z.object({
  // Paginação
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  // Filtros (note que subestacaoId foi removido daqui)
  nomeEquipamento: z.string().optional(),
  tipo: tipoComponenteEnum.optional(),
  numeroSerie: z.string().optional(),
});

export const listarComponentesSchema = z.object({
  body: z.object({}).optional(),
  params: listarComponentesParamsSchema, // <-- ALTERADO: Usa o novo schema de params
  query: listarComponentesQuerySchema,
});
// Listar Componente por ID
const listarcomponenteParamsSchema = z.object({
  componenteId: z.string().uuid({ message: "ID de componente inválido." }),
});

export const listarcomponenteSchema = z.object({
  body: z.object({}).optional(),
  params: listarcomponenteParamsSchema,
  query: z.object({}).optional(),
});

// -----------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço
// Cadastrar ordem de serviço

//------------
const connectByIdSchema = z.object({
  connect: z.object({ id: z.string().uuid() }),
});

const connectByMatriculaSchema = z.object({
  connect: z.object({ matricula: z.number().int().positive() }),
});

const disconnectSchema = z.object({
  disconnect: z.literal(true),
});

const setByIdsSchema = z.object({
  set: z.array(z.object({ id: z.string().uuid() })),
});

const setByMatriculasSchema = z.object({
  set: z.array(
    z.object({
      matricula: z.coerce.number(),
    })
  ),
});

const cadastrarOrdemBodySchema = z
  .object({
    // --- Dados Escalares ---
    responsavel: z.string().optional(),
    localizacao: z.string().optional(),
    email: z
      .string()
      .email({ message: "Formato de e-mail inválido." })
      .optional(),
    contato: z.string().optional(),
    valorServico: z.coerce.number().positive().optional().nullable(),
    numeroOrcamento: z.string().optional(),
    descricaoInicial: z.string().max(10000).nullable().optional(),
    tipoServico: tipoServicoEnum,
    previsaoInicio: dateSchema,
    previsaoTermino: dateSchema.optional().nullable(),
    conclusao: z.string().optional().nullable(),
    recomendacoes: z.string().optional().nullable(),

    // --- Relações (Nova Estrutura) ---
    cliente: connectByIdSchema,
    engenheiro: connectByMatriculaSchema.nullable(),
    supervisor: connectByMatriculaSchema.nullable(),
    tecnicos: setByMatriculasSchema.refine((data) => data.set.length > 0, {
      message: "É necessário associar pelo menos um técnico.",
    }),
    subestacoes: setByIdsSchema,
    componentes: setByIdsSchema,
  })
  .transform((data) => {
    // --- CORREÇÃO APLICADA AQUI ---
    // Transforma o payload "Prisma-ready" validado para o formato "plano"
    // que a sua camada de serviço (`homeServices.js`) espera.
    const {
      cliente,
      engenheiro,
      supervisor,
      tecnicos,
      subestacoes,
      componentes,
      ...scalarData
    } = data;

    return {
      ...scalarData,
      clienteId: cliente.connect.id,
      engenheiroMatricula: engenheiro?.connect.matricula ?? null,
      supervisorMatricula: supervisor?.connect.matricula ?? null,
      tecnicos: tecnicos.set,
      subestacoesId: subestacoes.set.map((s) => s.id),
      componentesId: componentes.set.map((c) => c.id),
    };
  });

// Schema final exportado para a rota de criação
export const cadastrarOrdemSchema = z.object({
  body: cadastrarOrdemBodySchema,
});
// Atualizar dados ordem de serviço
// Schema para os parâmetros da rota de atualização
const atualizarOrdemParamsSchema = z.object({
  ordemId: z
    .string()
    .uuid({ message: "O ID da Ordem de Serviço deve ser um UUID válido." }),
});

// Schema base para o corpo da requisição de atualização
const atualizarOrdemBodySchema = z.object({
  // Campos descritivos
  descricaoInicial: z
    .string()
    .max(10000, {
      message: "A descrição inicial deve ter no máximo 10000 caracteres.",
    })
    .nullable()
    .optional(),
  observacoes: z.string().nullable(),
  conclusao: z.string().nullable(),
  recomendacoes: z.string().nullable(),

  // Status (seguindo o enum)
  status: statusOrdemEnum,

  // Datas
  previsaoInicio: z.string().datetime({ message: "Formato de data inválido." }),
  previsaoTermino: z
    .string()
    .datetime({ message: "Formato de data inválido." })
    .optional()
    .nullable(),

  // Equipa
  engenheiroMatricula: z.number().int().positive(),
  supervisorMatricula: z.number().int().positive(),
  tecnicos: setByMatriculasSchema.refine((data) => data.set.length > 0, {
    message: "É necessário associar pelo menos um técnico.",
  }),

  // Escopo
  subestacoes: z.array(
    z.object({
      id: z
        .string()
        .uuid({ message: "O ID da Ordem de Serviço deve ser um UUID válido." }),
      nome: z.string(),
      observacao: z.string(),
      componenteSchema,
    })
  ),
});

// --- Schema Base do Corpo da Requisição ---

const ordemBodySchema = z.object({
  // --- Dados Escalares ---
  responsavel: z.string().optional(),
  localizacao: z.string().optional(),
  email: z
    .string()
    .email({ message: "Formato de e-mail inválido." })
    .optional(),
  contato: z.string().optional(),
  valorServico: z.coerce.number().positive().optional().nullable(),
  numeroOrcamento: z.string().optional(),
  descricaoInicial: z.string().max(10000).optional().nullable(),
  tipoServico: tipoServicoEnum.optional(),
  previsaoInicio: dateSchema.optional(),
  previsaoTermino: dateSchema.optional().nullable(),
  conclusao: z.string().optional().nullable(),
  recomendacoes: z.string().optional().nullable(),
  status: statusOrdemEnum, // Você pode usar o enum de status aqui se o tiver

  // --- Relações ---
  engenheiro: connectByMatriculaSchema.or(disconnectSchema).optional(),
  supervisor: connectByMatriculaSchema.or(disconnectSchema).optional(),
  tecnicos: setByMatriculasSchema.refine((data) => data.set.length > 0, {
    message: "É necessário associar pelo menos um técnico.",
  }),
  subestacoes: setByIdsSchema.optional(),
  componentes: setByIdsSchema.optional(),
});

export const atualizarOrdemSchema = z.object({
  body: ordemBodySchema, // .partial() torna todos os campos do body opcionais
  params: atualizarOrdemParamsSchema,
});
// Deletar ordem ou cancelar
// Schema para os parâmetros da rota de exclusão/cancelamento
const deletarOuCancelarOrdemParamsSchema = z.object({
  ordemId: z
    .string()
    .uuid({ message: "O ID da Ordem de Serviço deve ser um UUID válido." }),
});

export const deletarOuCancelarOrdemSchema = z.object({
  body: z.object({}).optional(),
  params: deletarOuCancelarOrdemParamsSchema,
  query: z.object({}).optional(),
});
// Listar ordens de serviços ( por funcionário )
const listarOrdensQuerySchema = z.object({
  // Paginação
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  // Filtros existentes
  status: statusOrdemEnum.optional(),
  numeroOs: z.string().optional(),
  cliente: z.string().optional(),

  // --- NOVOS FILTROS ---
  engenheiroMatricula: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  supervisorMatricula: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // Filtros de data
  dataInicio: dateSchema,
  dataFim: dateSchema,
});

export const listarOrdensSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listarOrdensQuerySchema,
});
// Listar ordem por ID
// Schema para os parâmetros da rota de busca de OS por ID
const listarOrdemParamsSchema = z.object({
  ordemId: z
    .string()
    .uuid({ message: "O ID da Ordem de Serviço deve ser um UUID válido." }),
});

export const listarOrdemSchema = z.object({
  body: z.object({}).optional(),
  params: listarOrdemParamsSchema,
  query: z.object({}).optional(),
});

export const gerarPDFSchema = z.object({
  params: z.object({
    matricula: z.coerce
      .number({ invalid_type_error: "Matrícula inválida." })
      .positive("Matrícula deve ser um número positivo."),
    ordemId: z.string().uuid("O ID da OS para o PDF deve ser um UUID válido."),
  }),
});

// -------------------------------------------------------------------------------------------------------
// Secção Ordem de Serviço - Fluxo de Finalização
// Schema para solicitar finalização
const solicitarFinalizacaoParamsSchema = z.object({
  ordemId: z
    .string()
    .uuid({ message: "O ID da Ordem de Serviço na URL é inválido." }),
});

export const solicitarFinalizacaoSchema = z.object({
  body: z.object({}).optional(),
  params: solicitarFinalizacaoParamsSchema,
  query: z.object({}).optional(),
});
// Schema para revisar-adm
const revisarAdmParamsSchema = z.object({
  ordemId: z
    .string()
    .uuid({ message: "O ID da Ordem de Serviço na URL é inválido." }),
});

export const revisarAdmSchema = z.object({
  body: z.object({}).optional(),
  params: revisarAdmParamsSchema,
  query: z.object({}).optional(),
});
// Schema para aprovar-final
const aprovarFinalParamsSchema = z.object({
  ordemId: z
    .string()
    .uuid({ message: "O ID da Ordem de Serviço na URL é inválido." }),
});

const aprovarFinalBodySchema = z.object({
  conclusao: z
    .string()
    .min(10, { message: "A conclusão deve ter no mínimo 10 caracteres." })
    .optional(),
  recomendacoes: z.string().optional(),
});

export const aprovarFinalSchema = z.object({
  body: aprovarFinalBodySchema,
  params: aprovarFinalParamsSchema,
  query: z.object({}).optional(),
});
// -------------------------------------------------------------------------------------------------------
// Secção Ensaio
// Schema para os parâmetros da rota de cadastro de ensaio
const cadastrarEnsaioParamsSchema = z.object({
  numeroOs: z.coerce.string(1000, {
    message: "Máximo de 1000 caracteres atingido.",
  }),
});

// Schema para o corpo da requisição de cadastro de ensaio
const cadastrarEnsaioBodySchema = z.object({
  // Campos Obrigatórios
  componenteId: z
    .string()
    .uuid({ message: "O ID do componente é obrigatório." }),
  tipo: tipoComponenteEnum, // Reutilizamos o enum para o tipo de ensaio
  dados: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message:
      "O objeto 'dados' com os resultados do ensaio não pode estar vazio.",
  }),

  // Campos Opcionais
  dataEnsaio: dateSchema.optional(),
  responsavelMatricula: z.coerce.number().int().positive().optional(),
  equipamentosIds: z
    .array(
      z
        .string()
        .uuid({ message: "Cada ID de equipamento deve ser um UUID válido." })
    )
    .optional(),
});

export const cadastrarEnsaioSchema = z.object({
  body: cadastrarEnsaioBodySchema,
  params: cadastrarEnsaioParamsSchema,
  query: z.object({}).optional(),
});
// Atualizar ensaio existente
// Schema para os parâmetros da rota de atualização de ensaio
const atualizarEnsaioParamsSchema = z.object({
  ensaioId: z.string().uuid({ message: "O ID do ensaio na URL é inválido." }),
});

// Schema base para o corpo da requisição de atualização de ensaio
const atualizarEnsaioBodySchema = z.object({
  // Apenas os campos que podem ser alterados
  dados: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message: "O objeto 'dados' não pode ser vazio.",
  }),
  dataEnsaio: dateSchema,
  responsavelMatricula: z.coerce.number().int().positive(),
  equipamentosIds: z.array(
    z
      .string()
      .uuid({ message: "Cada ID de equipamento deve ser um UUID válido." })
  ),
});

export const atualizarEnsaioSchema = z.object({
  body: atualizarEnsaioBodySchema.partial(), // .partial() torna todos os campos opcionais
  params: atualizarEnsaioParamsSchema,
  query: z.object({}).optional(),
});
// Deletar ensaio ADMIN
// Schema para os parâmetros da rota de exclusão de ensaio
const deletarEnsaioParamsSchema = z.object({
  ensaioId: z.string().uuid({ message: "O ID do ensaio na URL é inválido." }),
});

export const deletarEnsaioSchema = z.object({
  body: z.object({}).optional(),
  params: deletarEnsaioParamsSchema,
  query: z.object({}).optional(),
});

// -------------------------------------------------------------------------------------------------------
// Secção home #dashboard
export const dashBoardSchema = z.object();

// -------------------------------------------------------------------------------------------------------
// Secção de registros de atividade
// Esquema para validar a consulta de registros
const listarLogsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  // Filtros
  acao: z.enum(["CRIAR", "ATUALIZAR", "EXCLUIR"]).optional(),
  entidade: z.string().optional(),
  feitoPor: z.coerce
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

export const listarLogsSchema = z.object({
  // No hay validaciones de 'body' o 'params' para esta ruta
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listarLogsQuerySchema,
});

// ------------------------------------------------------
// Secção Fotos
export const adicionarFotosSchema = z.object({
  params: z.object({
    // Valida que 'numeroOs' é um número inteiro e positivo
    numeroOs: z.coerce
      .number({
        required_error: "O número da OS é obrigatório.",
        invalid_type_error: "O número da OS deve ser um número.",
      })
      .int("O número da OS deve ser um inteiro.")
      .positive("O número da OS deve ser um número positivo."),
  }),
  // body: z.object({
  //   descricao: z.coerce.string().max(1000,"Máximo de 1000 caracteres."),
  //   tipoFoto: tipoFotoEnum
  // })
});

export const excluirFotosSchema = z.object({
  params: z.object({
    // Valida que 'numeroOs' é um número inteiro e positivo
    numeroOs: z.coerce
      .number({
        required_error: "O número da OS é obrigatório.",
        invalid_type_error: "O número da OS deve ser um número.",
      })
      .int("O número da OS deve ser um inteiro.")
      .positive("O número da OS deve ser um número positivo."),
    cloudinaryId: z.string().min(1, "O cloudinaryId não pode ser vazio"),
  }),
});

export const atualizarDescricaoFotosSchema = z.object({
  params: z.object({
    // Valida que 'numeroOs' é um número inteiro e positivo
    numeroOs: z.coerce
      .number({
        required_error: "O número da OS é obrigatório.",
        invalid_type_error: "O número da OS deve ser um número.",
      })
      .int("O número da OS deve ser um inteiro.")
      .positive("O número da OS deve ser um número positivo."),
    ensaioId: z.string().min(1, "O cloudinaryId não pode ser vazio"),
    cloudinaryId: z.string().min(1, "O cloudinaryId não pode ser vazio"),
  }),
  body: z
    .object({
      descricao: z.coerce.string().max(1000, "Máximo de 1000 caracteres."),
    })
    .optional(),
});

export const adicionarFotosEnsaioSchema = z.object({
  params: z.object({
    // Valida que 'numeroOs' é um número inteiro e positivo
    numeroOs: z.coerce
      .number({
        required_error: "O número da OS é obrigatório.",
        invalid_type_error: "O número da OS deve ser um número.",
      })
      .int("O número da OS deve ser um inteiro.")
      .positive("O número da OS deve ser um número positivo."),
    ensaioId: z.string().uuid({ message: "ID de ensaio inválido." }),
  }),
  // body: z.object({
  //   descricao: z.coerce.string().max(1000,"Máximo de 1000 caracteres."),
  //   tipoFoto: tipoFotoEnum
  // })
});
