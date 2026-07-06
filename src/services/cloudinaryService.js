const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const subirFirmaNube = async (firmaBase64, identificadorUnico) => {
    try {
        const respuesta = await cloudinary.uploader.upload(firmaBase64, {
            folder: 'prestafacil_firmas',
            public_id: `firma_${identificadorUnico}`,
            resource_type: 'image'
        });
        
        console.log('✅ Firma subida a Cloudinary:', respuesta.secure_url);
        return respuesta.secure_url; // Devolvemos el link corto y seguro de internet
    } catch (error) {
        console.error('❌ Error subiendo firma a Cloudinary:', error);
        return null;
    }
};

module.exports = { subirFirmaNube };