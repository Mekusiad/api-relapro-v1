import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Adiciona um log para confirmar que a configuração foi lida corretamente
console.log(
  "Cloudinary config cloud_name:",
  process.env.CLOUDINARY_NAME ? "Carregado" : "NÃO CARREGADO"
);

export default cloudinary;

/**
 * Exclui um recurso (imagem, vídeo, etc.) do Cloudinary usando o seu public_id.
 * @param {string} publicId - O ID público do recurso a ser excluído (este é o `cloudinaryId` que você armazena no seu banco de dados).
 * @returns {Promise<void>} Uma promessa que é resolvida quando a exclusão é bem-sucedida.
 * @throws {Error} Lança um erro se a exclusão no Cloudinary falhar.
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Verifica se um ID público foi fornecido para evitar chamadas de API desnecessárias.
    if (!publicId) {
      console.warn("Tentativa de exclusão no Cloudinary sem um publicId.");
      return;
    }

    // Chama o método 'destroy' da API do uploader do Cloudinary para excluir o recurso.
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Se ocorrer um erro durante a comunicação com a API do Cloudinary,
    // ele será capturado aqui.
    console.error(
      `Falha ao excluir o recurso ${publicId} do Cloudinary:`,
      error
    );

    // É importante relançar o erro. Isso permite que a função que chamou
    // (no seu caso, a `excluirOs`) saiba que a operação falhou e possa
    // parar o processo (por exemplo, evitar apagar o registo do banco de dados).
    throw new Error("Falha na comunicação com o serviço de gestão de imagens.");
  }
};
