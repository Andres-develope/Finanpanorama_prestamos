const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreoConfirmacion = async (clienteEmail, clienteNombre) => {
    try {
        const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: clienteEmail, 
            subject: 'Confirmación de Solicitud - Finanpanorama',
            html: `<div style='padding:20px; border:1px solid #ccc; font-family:sans-serif;'><h2>¡Hola, ${clienteNombre}!</h2><p>Recibimos tu solicitud de crédito exitosamente en Finanpanorama.</p></div>`
        });
        
        console.log('✅ Correo enviado con Resend:', response);
        return response;
    } catch (error) {
        console.error('❌ Error enviando con Resend:', error);
        return null;
    }
};

module.exports = { enviarCorreoConfirmacion };