import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export const gerarPDFService = async (req, res) => {
  // ==================================================
  // INÍCIO DA CORREÇÃO FINAL
  // ==================================================
  console.log("[pdfService] Iniciando a geração de PDF...");
  console.log(
    "[pdfService] Conteúdo de req.params:",
    JSON.stringify(req.params, null, 2)
  );
  console.log(
    "[pdfService] Conteúdo de req.validatedData:",
    JSON.stringify(req.validatedData, null, 2)
  );

  // Tentativa 1 (Ideal): Ler dos dados validados pelo middleware.
  let ordemId = req.validatedData?.params?.ordemId;

  // Tentativa 2 (Fallback): Se a primeira falhar, tenta ler diretamente dos parâmetros da URL.
  if (!ordemId) {
    console.warn(
      "[pdfService] Não foi possível encontrar 'ordemId' em req.validatedData.params. Tentando req.params..."
    );
    ordemId = req.params?.ordemId;
  }
  // ==================================================
  // FIM DA CORREÇÃO FINAL
  // ==================================================

  console.log(`[pdfService] ID da OS extraído: ${ordemId}`);

  if (!ordemId) {
    return res.status(400).json({
      status: false,
      message: "O ID da Ordem de Serviço não foi fornecido na URL.",
    });
  }

  const osData = await prisma.ordem.findUnique({
    where: { id: ordemId },
    include: {
      cliente: true,
      tecnicos: true,
      engenheiro: true,
      supervisor: true,
      fotos: true,
      componentes: {
        include: {
          subestacao: true,
          ensaios: {
            include: {
              responsavel: true,
              fotos: true,
              equipamentos: true,
            },
          },
        },
      },
    },
  });

  if (!osData) {
    return res
      .status(404)
      .json({ status: false, message: "Ordem de serviço não encontrada." });
  }

  const ordemComponentes = [
    "MALHA",
    "RESISTOR",
    "PARARAIO",
    "CABOMUFLA",
    "CHAVE_SECCIONADORA_ALTA",
    "CHAVE_SECCIONADORA_MEDIA",
    "DISJUNTOR_ALTA",
    "DISJUNTOR_MEDIA",
    "TRAFO_ALTA",
    "TRAFO_CORRENTE",
    "TRAFO_POTENCIAL",
    "TRAFO_MEDIA",
    "BATERIA",
  ];
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
      const componenteReestruturado = reestruturarComponente(componente);
      subestacoesMap.get(subId).componentes.push(componenteReestruturado);
    }
  }

  subestacoesMap.forEach((subestacao) => {
    subestacao.componentes.sort((a, b) => {
      const indexA = ordemComponentes.indexOf(a.tipo);
      const indexB = ordemComponentes.indexOf(b.tipo);
      const effectiveIndexA = indexA === -1 ? Infinity : indexA;
      const effectiveIndexB = indexB === -1 ? Infinity : indexB;
      return effectiveIndexA - effectiveIndexB;
    });
  });

  const subestacoesOrdenadas = Array.from(subestacoesMap.values());

  const responseData = {
    ...osData,
    subestacoes: subestacoesOrdenadas,
  };

  console.log("[pdfService] ✅ Dados para o PDF preparados com sucesso!");
  return res.status(200).json({ status: true, data: responseData });
};
