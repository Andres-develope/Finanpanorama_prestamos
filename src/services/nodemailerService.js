const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Brevo por API HTTP: funciona en Render Free (que bloquea SMTP). BREVO_SENDER debe ser un remitente verificado en Brevo.
const enviarConBrevo = async (clienteEmail, clienteNombre) => {
    try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'Finanpanorama', email: process.env.BREVO_SENDER || process.env.EMAIL_USER },
                to: [{ email: clienteEmail }],
                subject: 'Confirmación de Solicitud de Crédito - Finanpanorama',
                htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2c3e50;">¡Hola, ${clienteNombre}!</h2>
                    <p>Hemos recibido tu solicitud de crédito exitosamente en <strong>Finanpanorama</strong>.</p>
                    <p>Actualmente estamos validando tu información y el pagaré firmado. En breve nos comunicaremos contigo para darte una respuesta final.</p>
                    <br>
                    <p>Atentamente,<br><strong>El equipo de Finanpanorama / PrestaFácil</strong></p>
                </div>`
            }),
            signal: AbortSignal.timeout(15000)
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error('❌ Error Brevo:', res.status, body);
            return null;
        }
        console.log('✅ Correo enviado con Brevo a:', clienteEmail);
        return body;
    } catch (error) {
        console.error('❌ Error enviando con Brevo:', error.message);
        return null;
    }
};

const enviarCorreoConfirmacion = async (clienteEmail, clienteNombre) => {
    if (process.env.BREVO_API_KEY) {
        return enviarConBrevo(clienteEmail, clienteNombre);
    }
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