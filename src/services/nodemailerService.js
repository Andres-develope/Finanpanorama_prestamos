const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreoConfirmacion = async (clienteEmail, clienteNombre) => {
    try {
        const mailOptions = {
            from: '"Finanpanorama" <' + process.env.EMAIL_USER + '>',
            to: clienteEmail, // AHORA SÍ LE LLEGARÁ AL CORREO QUE EL CLIENTE PONGA
            subject: 'Confirmación de Solicitud de Crédito - Finanpanorama',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2c3e50;">¡Hola, ${clienteNombre}!</h2>
                    <p>Hemos recibido tu solicitud de crédito exitosamente en <strong>Finanpanorama</strong>.</p>
                    <p>Actualmente estamos validando tu información y el pagaré firmado. En breve nos comunicaremos contigo para darte una respuesta final.</p>
                    <br>
                    <p>Atentamente,<br><strong>El equipo de Finanpanorama / PrestaFácil</strong></p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo real enviado vía Gmail a:', clienteEmail);
        return info;
    } catch (error) {
        console.error('❌ Error enviando correo vía Gmail:', error);
        return null;
    }
};

module.exports = { enviarCorreoConfirmacion };