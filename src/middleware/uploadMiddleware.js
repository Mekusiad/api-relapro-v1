import multer from 'multer';

// Define o armazenamento em memória. O arquivo ficará disponível como um Buffer.
const storage = multer.memoryStorage();

// Função para filtrar e aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Rejeita o arquivo e passa um erro que pode ser capturado
    cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
  }
};

// Configuração do Multer para usar as definições acima
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite de 5MB por arquivo
  },
  fileFilter: fileFilter
});

// Middleware que irá processar os arquivos e colocá-los em 'req.files'
export const uploadEmMemoria = upload.any();

