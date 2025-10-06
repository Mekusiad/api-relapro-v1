import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Adiciona um log para confirmar que a configuração foi lida corretamente
console.log('Cloudinary config cloud_name:', process.env.CLOUDINARY_NAME ? 'Carregado' : 'NÃO CARREGADO');

export default cloudinary;