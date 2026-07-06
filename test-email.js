require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
    console.log('Probando Resend con la key:', process.env.RESEND_API_KEY.substring(0, 8) + '...');
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'andfell0414@gmail.com',
            subject: 'Test API Directo',
            html: '<p>Este es un test directo desde node</p>'
        });
        console.log('Respuesta:', data);
    } catch (e) {
        console.error('Error detallado:', e);
    }
}
test();