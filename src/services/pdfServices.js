// backend/src/services/pdfServices.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Função auxiliar para reestruturar os dados de um componente,
 * movendo os campos de detalhes para dentro de um objeto 'info'.
 */
const reestruturarComponente = (componente) => {
  if (!componente) return componente;

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

  const infoObject = {};
  const componentCore = { ...componente };

  infoFields.forEach((field) => {
    if (componentCore.hasOwnProperty(field)) {
      infoObject[field] = componentCore[field];
      delete componentCore[field];
    }
  });

  return { ...componentCore, info: infoObject };
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
  "bateria",
];

export const gerarPDFService = async (req, res) => {
  const { ordemId } = req.validatedData.params;

  const osData = await prisma.ordem.findUnique({
    where: { id: ordemId },
    include: {
      cliente: true,
      engenheiro: { select: { nome: true } },
      supervisor: { select: { nome: true } },
      tecnicos: { select: { nome: true } },
      fotos: true,
      componentes: {
        orderBy: { nomeEquipamento: "asc" },
        include: {
          subestacao: true,
          ensaios: {
            where: { ordemId: ordemId },
            include: {
              equipamentos: true,
              fotos: true,
              responsavel: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!osData) {
    return res
      .status(404)
      .json({ status: false, message: "OS não localizada ou excluída" });
  }

  const subestacoesMap = new Map();

  for (const componente of osData.componentes) {
    if (componente.subestacao) {
      const subId = componente.subestacao.id;
      if (!subestacoesMap.has(subId)) {
        subestacoesMap.set(subId, {
          ...componente.subestacao,
          componentes: [],
        });
      }
      // APLICA A REESTRUTURAÇÃO AQUI
      const componenteReestruturado = reestruturarComponente(componente);
      subestacoesMap.get(subId).componentes.push(componenteReestruturado);
    }
  }

  // --- LÓGICA DE ORDENAÇÃO ADICIONADA AQUI ---
  // Itera sobre cada subestação no mapa para ordenar seus componentes.
  subestacoesMap.forEach((subestacao) => {
    subestacao.componentes.sort((a, b) => {
      // Encontra a posição de cada tipo de componente na lista de ordem.
      const indexA = ordemComponentes.indexOf(a.tipo);
      const indexB = ordemComponentes.indexOf(b.tipo);

      // Se um tipo não estiver na lista, ele é considerado "infinito" para que vá para o final.
      const effectiveIndexA = indexA === -1 ? Infinity : indexA;
      const effectiveIndexB = indexB === -1 ? Infinity : indexB;

      return effectiveIndexA - effectiveIndexB;
    });
  });
  // --- FIM DA LÓGICA DE ORDENAÇÃO ---

  const dadosParaPdf = {
    ...osData,
    subestacoes: Array.from(subestacoesMap.values()),
  };
  delete dadosParaPdf.componentes;

  return res.status(200).json({
    status: true,
    message: "Dados para PDF gerados com sucesso.",
    data: dadosParaPdf,
  });
};
