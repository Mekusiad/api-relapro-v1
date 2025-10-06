import { PrismaClient } from "@prisma/client";
import { handleError } from "../utils/errorHandler.js";
import cloudinary from "../config/cloudinary.js";

const prisma = new PrismaClient();

const uploadParaCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const adicionarFotosService = async (req, res) => {
  const { numeroOs } = req.params;
  const { tipoFoto, descricao } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Nenhum arquivo de imagem foi enviado.",
      });
    }
    if (!tipoFoto) {
      return res
        .status(400)
        .json({ status: false, message: 'O campo "tipoFoto" é obrigatório.' });
    }
    const ordemDeServico = await prisma.ordem.findUnique({
      where: { numeroOs },
    });
    if (!ordemDeServico) {
      return res.status(404).json({
        status: false,
        message: `Ordem de Serviço ${numeroOs} não encontrada.`,
      });
    }

    // 1. Prepara e executa o upload de todos os arquivos para o Cloudinary em paralelo
    const promessasDeUpload = req.files.map((file) => {
      const opcoesDeUpload = {
        folder: `os-fotos/${numeroOs}`,
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
      };
      return uploadParaCloudinary(file.buffer, opcoesDeUpload);
    });

    const resultadosDoUpload = await Promise.all(promessasDeUpload);

    // 2. Prepara os dados para salvar no banco com base nos resultados do Cloudinary
    const fotosParaSalvar = resultadosDoUpload.map((result) => ({
      fotoUrl: result.secure_url,
      cloudinaryId: result.public_id,
      tipoFoto: tipoFoto.toUpperCase(),
      descricao: descricao || null,
      ordemOs: numeroOs,
      funcionarioId: req.user.id,
    }));
    // 3. Salva os registros das fotos no banco de dados
    await prisma.foto.createMany({
      data: fotosParaSalvar,
    });

    return res.status(201).json({
      status: true,
      message: `${req.files.length} foto(s) adicionada(s) com sucesso!`,
      data: fotosParaSalvar.map((foto) => foto.fotoUrl),
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Ocorreu um erro ao processar e enviar as fotos."
    );
  }
};

export const excluirFotodaOs = async (req, res) => {
  // Os dados validados agora contêm tanto o numeroOs quanto o cloudinaryId
  const { numeroOs, cloudinaryId } = req.validatedData;

  // --- CORREÇÃO PRINCIPAL AQUI ---
  // Procuramos pela foto que tenha o cloudinaryId E que também pertença
  // à Ordem de Serviço especificada (ordemOs).
  const foto = await prisma.foto.findFirst({
    where: {
      cloudinaryId: cloudinaryId,
      ordemOs: numeroOs, // Garante que a foto pertence à OS correta
    },
  });

  // Se a foto não for encontrada com AMBAS as condições, retorna erro.
  // Isso protege contra a exclusão de fotos de outras OSs.
  if (!foto) {
    return res.status(404).json({
      status: false,
      message: "Foto não encontrada ou não pertence a esta Ordem de Serviço.",
    });
  }

  // O resto da lógica permanece o mesmo, pois agora temos a certeza
  // de que estamos a apagar a foto correta.

  // 1. Tenta apagar do Cloudinary primeiro
  if (foto.cloudinaryId) {
    try {
      await cloudinary.uploader.destroy(foto.cloudinaryId);
      console.log(`Foto ${foto.cloudinaryId} excluída do Cloudinary.`);
    } catch (err) {
      // Mesmo que falhe no Cloudinary, continuamos para apagar do nosso DB.
      // Pode ser útil logar este erro de forma mais robusta.
      console.warn(
        "Aviso: Falha ao excluir a foto do Cloudinary:",
        err.message
      );
    }
  }

  // 2. Apaga o registo da foto do nosso banco de dados
  const fotoExcluida = await prisma.foto.delete({
    where: { id: foto.id },
  });
  console.log(`Registo da Foto ID ${foto.id} excluído do banco de dados.`);

  await prisma.logAtividade.create({
    data: {
      acao: "EXCLUIR",
      entidade: "foto",
      // 'dadosAfetados' armazena um snapshot dos dados após a atualização
      dadosAfetados: fotoExcluida,
      feitoPor: req.user.matricula,
    },
  });

  return res.status(200).json({
    status: true,
    message: "Foto excluída com sucesso.",
  });
};

export const atualizarDescricaoFotodaOs = async (req, res) => {
  const { numeroOs, cloudinaryId } = req.params;
  const { descricao } = req.body;

  try {
    // Procura pela foto no banco de dados para garantir que ela existe
    const fotoExistente = await prisma.foto.findUnique({
      where: { cloudinaryId, ordemOs: numeroOs },
    });

    if (!fotoExistente) {
      return res.status(404).json({
        status: false,
        message: "Foto não encontrada.",
      });
    }

    // Atualiza apenas o campo 'descricao' da foto encontrada
    const fotoAtualizada = await prisma.foto.update({
      where: { cloudinaryId },
      data: {
        descricao: descricao,
      },
    });

    await prisma.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "foto",
        dadosAfetados: fotoAtualizada,
        feitoPor: req.user.matricula,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Descrição da foto atualizada com sucesso.",
      data: fotoAtualizada,
    });
  } catch (error) {
    // Usa o seu handler de erro genérico
    return handleError(
      res,
      error,
      "Ocorreu um erro ao atualizar a descrição da foto."
    );
  }
};

export const adicionarFotosEnsaioService = async (req, res) => {
  // Parâmetros vêm da URL da rota
  const { numeroOs, ensaioId } = req.params;
  // Outros dados vêm do corpo do formulário multipart
  const { descricao } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Nenhum arquivo de imagem foi enviado.",
      });
    }

    // 1. Valida se o ensaio existe e obtém o tipo do componente associado
    const ensaio = await prisma.ensaio.findUnique({
      where: { id: ensaioId },
      include: { componente: true }, // Inclui o componente para obter o TIPO
    });

    if (!ensaio) {
      return res.status(404).json({
        status: false,
        message: `Ensaio com ID ${ensaioId} não encontrado.`,
      });
    }

    // O tipo do componente (ex: "BATERIA", "MALHA") será usado no caminho da pasta
    const tipoComponente = ensaio.componente.tipo;

    // 2. Prepara e executa o upload para o Cloudinary com a nova estrutura de pastas
    const promessasDeUpload = req.files.map((file) => {
      const opcoesDeUpload = {
        // Estrutura de pasta desejada: os-fotos/12345/ensaios/BATERIA
        folder: `os-fotos/${numeroOs}/ensaios/${tipoComponente}`,
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
      };
      return uploadParaCloudinary(file.buffer, opcoesDeUpload);
    });

    const resultadosDoUpload = await Promise.all(promessasDeUpload);

    // 3. Prepara os dados para salvar no banco de dados
    const fotosParaSalvar = resultadosDoUpload.map((result) => ({
      fotoUrl: result.secure_url,
      cloudinaryId: result.public_id,
      descricao: descricao || null,
      funcionarioId: req.user.id,
      tipoFoto: "ENSAIO",
      ensaioId: ensaioId,
      ordemOs: numeroOs,
    }));

    // 4. Salva os registros das fotos no banco de dados
    const fotosCriadas = await prisma.foto.createMany({
      data: fotosParaSalvar,
    });

    await prisma.logAtividade.create({
      data: {
        acao: "CRIAR",
        entidade: "fotos",
        // 'dadosAfetados' armazena um snapshot dos dados após a atualização
        dadosAfetados: fotosCriadas,
        feitoPor: req.user.matricula,
      },
    });

    return res.status(201).json({
      status: true,
      message: `${resultadosDoUpload.length} foto(s) de ensaio adicionada(s) com sucesso!`,
      data: fotosCriadas,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Ocorreu um erro ao processar e enviar as fotos do ensaio."
    );
  }
};

export const atualizarDescricaoFotodoEnsaio = async (req, res) => {
  const { numeroOs, ensaioId, cloudinaryId } = req.params;
  const { descricao } = req.body;

  try {

    console.log("OOOOOEEEOEOEO")
    // Procura pela foto no banco de dados para garantir que ela existe
    const fotoExistente = await prisma.foto.findUnique({
      where: { cloudinaryId, ordemOs: numeroOs },
    });

    if (!fotoExistente) {
      return res.status(404).json({
        status: false,
        message: "Foto não encontrada.",
      });
    }

    // Atualiza apenas o campo 'descricao' da foto encontrada
    const fotoAtualizada = await prisma.foto.update({
      where: { cloudinaryId },
      data: {
        descricao: descricao,
      },
    });

    await prisma.logAtividade.create({
      data: {
        acao: "ATUALIZAR",
        entidade: "foto",
        dadosAfetados: fotoAtualizada,
        feitoPor: req.user.matricula,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Descrição da foto atualizada com sucesso.",
      data: fotoAtualizada,
    });
  } catch (error) {
    // Usa o seu handler de erro genérico
    return handleError(
      res,
      error,
      "Ocorreu um erro ao atualizar a descrição da foto."
    );
  }
};